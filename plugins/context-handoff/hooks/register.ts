import type { EngineInterface, Register } from 'claude-code'
import type { Handoff } from '../types'

export const DEFAULT_THRESHOLD_PERCENT = 50
export const COMPLETE_TOOL_NAME = 'handoff_complete'
export const COMPLETE_TOOL = `mcp__context-handoff__${COMPLETE_TOOL_NAME}`

// Before the handoff starts, the locked session may only look around and start
// it. `date`, read-only git and writing a handoff file cover the built-in
// handoff; a configured skill unlocks everything else once it is running.
const LOOKING_TOOLS = new Set(['Read', 'Grep', 'Glob', 'ToolSearch', 'Skill'])
const READ_ONLY_COMMAND = /^\s*(date\b|git\s+(status|log|diff|branch|rev-parse|show|worktree\s+list)\b)/
const COMMAND_SEPARATOR = /&&|\|\||;/
const HANDOFF_PATH = /handoff/i

const HANDOFF = { plugin: 'context-handoff', key: 'handoff' } as const
const HANDING_OFF = { plugin: 'context-handoff', key: 'isHandingOff' } as const
const WARNED = { plugin: 'context-handoff', key: 'hasWarned' } as const

type Settings = { threshold: number; skill: string }

type CallInput = { command?: unknown; file_path?: unknown; skill?: unknown; location?: unknown; successor?: unknown }

export const readSettings = (options: Record<string, unknown>): Settings => {
  const threshold = Number(options.threshold)

  return {
    threshold: threshold > 0 && threshold <= 100 ? threshold : DEFAULT_THRESHOLD_PERCENT,
    skill: String(options.skill ?? '').trim().replace(/^\//, ''),
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
  typeof command === 'string' && command.split(COMMAND_SEPARATOR).every(part => READ_ONLY_COMMAND.test(part))

const isAllowedBeforeHandoff = (tool: string, input: CallInput) =>
  LOOKING_TOOLS.has(tool) ||
  (tool === 'Bash' && isReadOnlyCommand(input.command)) ||
  (tool === 'Write' && typeof input.file_path === 'string' && HANDOFF_PATH.test(input.file_path))

const describeHandoff = ({ location, successor }: Handoff) =>
  successor === '' ? location : `${location}, continued by ${successor}`

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
    const percent = e.context.percent ?? 0
    const { value: hasWarned = false } = await $.state.get(WARNED)

    if (percent < settings.threshold || hasWarned) {
      return next(e)
    }

    await $.state.set(WARNED, true)
    $.ui.toast(`Context ${percent}%: handing this session off.`)
    $.ui.status(`handoff due (${percent}%)`)

    return next(e)
  })

  on('tool.call', { tool: COMPLETE_TOOL }, async ($, e) => {
    const input = e as CallInput
    const handoff = { location: String(input.location ?? ''), successor: String(input.successor ?? '') }

    await $.state.set(HANDOFF, handoff)
    $.ui.status('handed off')

    return { result: `Handoff recorded: ${describeHandoff(handoff)}. Tell the user, then stop.` }
  })

  on('tool.call', async ($, e, next) => {
    // Subagents and engine forks run in their own windows; only the main loop hands off.
    if (e.agentId !== undefined || e.tool === COMPLETE_TOOL) {
      return next(e)
    }

    const { value: handoff } = await $.state.get(HANDOFF)

    if (handoff !== undefined && handoff !== null) {
      return { deny: `This session already handed off (${describeHandoff(handoff)}). Tell the user, then stop.` }
    }

    const { value: isHandingOff = false } = await $.state.get(HANDING_OFF)
    const percent = await contextPercent($)

    if (isHandingOff || percent < settings.threshold) {
      return next(e)
    }

    const input = e as CallInput

    if (!isAllowedBeforeHandoff(e.tool, input)) {
      return { deny: handoffInstructions(percent, settings) }
    }

    const ran = await next(e)

    // Once the configured skill runs, it decides which tools the handoff needs.
    if (e.tool === 'Skill' && settings.skill !== '' && input.skill === settings.skill && ran.deny === undefined) {
      await $.state.set(HANDING_OFF, true)
    }

    return ran
  }).catch(($, e, next) => next(e)) // fail open: a broken guard must never brick the session
}
