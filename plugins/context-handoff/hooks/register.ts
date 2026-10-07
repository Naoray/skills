import type { EngineInterface, Register } from 'claude-code'
import type { Guard, Handoff } from '../types'

export const DEFAULT_THRESHOLD_PERCENT = 50
export const COMPLETE_TOOL_NAME = 'handoff_complete'
export const COMPLETE_TOOL = `mcp__context-handoff__${COMPLETE_TOOL_NAME}`

// Before the handoff starts, the locked session may only look around and start
// it. `date`, read-only git and writing docs/handoffs/*.md cover the built-in
// handoff; a configured skill unlocks everything else while it runs.
const LOOKING_TOOLS = new Set(['Read', 'Grep', 'Glob', 'ToolSearch', 'Skill'])
const COMMAND_SEPARATOR = /&&|\|\||;/
// Pipes, redirects, background jobs, newlines and substitutions could hide any command.
const SHELL_ESCAPE = /[|<>&`\n\r]|\$\(/
const READ_ONLY_COMMAND = /^\s*(date(\s+\+\S+)?|git\s+(status|log|diff|show|rev-parse)(\s+[^-\s]\S*|\s+-[^-]\S*|\s+--(?!output)\S+)*)\s*$/
const HANDOFF_FILE = /(^|\/)docs\/handoffs\/[^/]+\.md$/

const GUARD = { plugin: 'context-handoff', key: 'guard' } as const
const NO_GUARD: Guard = { handoff: null, isHandingOff: false, hasWarned: false }

type Settings = { threshold: number; skill: string }

type CallInput = { command?: unknown; file_path?: unknown; skill?: unknown; location?: unknown; successor?: unknown }

const normalizeSkill = (name: unknown) => String(name ?? '').trim().replace(/^\//, '')

// Plugin skills are namespaced (`naoray-skills:solo-handoff`); compare by the bare name too.
const isSameSkill = (called: unknown, configured: string) => {
  const name = normalizeSkill(called)

  return name === configured || name.split(':').pop() === configured.split(':').pop()
}

export const readSettings = (options: Record<string, unknown>): Settings => {
  const threshold = Number(options.threshold)

  return {
    threshold: threshold > 0 && threshold <= 100 ? threshold : DEFAULT_THRESHOLD_PERCENT,
    skill: normalizeSkill(options.skill),
  }
}

const builtInSteps =
  '1. Run `date +%Y-%m-%d-%H%M; git status --short --branch`.\n' +
  '2. Write docs/handoffs/<timestamp>-<slug>.md with: Goal, Status, Decisions, Dead ends, Files, ' +
  'Next steps (the first specific enough to start at once), Open questions, and standing user instructions.\n' +
  `3. Call ${COMPLETE_TOOL} with the file's path as location.\n` +
  '4. Tell the user to continue in a fresh session from that file, then stop.'

const skillSteps = (skill: string) =>
  `Run the /${skill} skill with the Skill tool and follow it. ` +
  `When the handoff is done, call ${COMPLETE_TOOL} with where the handoff is and who continues.`

export const handoffInstructions = (percent: number, { threshold, skill }: Settings) =>
  `Context is at ${percent}% (handoff limit ${threshold}%). Stop the current work and hand off now.\n` +
  (skill === '' ? builtInSteps : skillSteps(skill))

const isReadOnlyCommand = (command: unknown) =>
  typeof command === 'string' &&
  command.split(COMMAND_SEPARATOR).every(part => !SHELL_ESCAPE.test(part) && READ_ONLY_COMMAND.test(part))

const isAllowedBeforeHandoff = (tool: string, input: CallInput) =>
  LOOKING_TOOLS.has(tool) ||
  (tool === 'Bash' && isReadOnlyCommand(input.command)) ||
  (tool === 'Write' && typeof input.file_path === 'string' && HANDOFF_FILE.test(input.file_path))

const describeHandoff = ({ location, successor }: Handoff) =>
  successor === '' ? location : `${location}, continued by ${successor}`

async function readGuard($: EngineInterface): Promise<Guard> {
  const { value } = await $.state.get(GUARD)

  return value ?? NO_GUARD
}

async function writeGuard($: EngineInterface, guard: Guard) {
  await $.state.set(GUARD, guard)
}

async function contextPercent($: EngineInterface) {
  return (await $.session.usage()).context.percent ?? 0
}

export const register: Register = (on, options) => {
  const settings = readSettings(options)

  on('session.start', async ($, e, next) => {
    const started = await next(e)

    await $.tool.register({
      name: COMPLETE_TOOL_NAME,
      description:
        'Marks this session as handed off once a handoff is written and its successor, if any, is running. ' +
        'Call it only at the end of a handoff. Afterwards this session refuses further work.',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Where the handoff is: a file path, a note id, a URL.' },
          successor: { type: 'string', description: 'Who continues, e.g. a process id. Empty when a person starts it.' },
        },
        required: ['location'],
      },
    })

    return started
  })

  on('session.measure', async ($, e, next) => {
    const percent = e.context.percent

    // Right after a compaction the figure is missing until the next response.
    if (percent === undefined) {
      return next(e)
    }

    const guard = await readGuard($)

    if (percent < settings.threshold && guard.hasWarned) {
      await writeGuard($, { ...guard, hasWarned: false })
      $.ui.status(undefined)

      return next(e)
    }

    if (percent < settings.threshold || guard.hasWarned) {
      return next(e)
    }

    await writeGuard($, { ...guard, hasWarned: true })
    $.ui.toast(`Context ${percent}%: handing this session off.`)
    $.ui.status(`handoff due (${percent}%)`)

    return next(e)
  })

  // A skill that stopped without completing the handoff must not leave the guard off.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) {
      return next(e)
    }

    const guard = await readGuard($)

    if (guard.isHandingOff) {
      await writeGuard($, { ...guard, isHandingOff: false })
    }

    return next(e)
  })

  on('tool.call', { tool: COMPLETE_TOOL }, async ($, e) => {
    if (e.agentId !== undefined) {
      return { deny: 'Only the main session can complete its own handoff.' }
    }

    const guard = await readGuard($)

    if (!guard.isHandingOff && (await contextPercent($)) < settings.threshold) {
      return { deny: 'No handoff is due: the context is below the handoff limit.' }
    }

    const input = e as CallInput
    const handoff = { location: String(input.location ?? ''), successor: String(input.successor ?? '') }

    await writeGuard($, { ...guard, handoff, isHandingOff: false })
    $.ui.status('handed off')

    return { result: `Handoff recorded: ${describeHandoff(handoff)}. Tell the user, then stop.` }
  })

  on('tool.call', async ($, e, next) => {
    // Subagents and engine forks run in their own windows; only the main loop hands off.
    if (e.agentId !== undefined || e.tool === COMPLETE_TOOL) {
      return next(e)
    }

    const guard = await readGuard($)

    if (guard.handoff !== null) {
      return { deny: `This session already handed off (${describeHandoff(guard.handoff)}). Tell the user, then stop.` }
    }

    if (guard.isHandingOff) {
      return next(e)
    }

    const percent = await contextPercent($)

    if (percent < settings.threshold) {
      return next(e)
    }

    const input = e as CallInput

    if (!isAllowedBeforeHandoff(e.tool, input)) {
      return { deny: handoffInstructions(percent, settings) }
    }

    const ran = await next(e)

    // Once the configured skill runs, it decides which tools the handoff needs, until the turn ends.
    if (e.tool === 'Skill' && settings.skill !== '' && isSameSkill(input.skill, settings.skill) && ran.deny === undefined) {
      await writeGuard($, { ...guard, isHandingOff: true })
    }

    return ran
  }).catch(($, e, next) => next(e)) // fail open: a broken guard must never brick the session
}
