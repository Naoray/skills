import type { Register } from 'claude-code'

export const DEFAULT_THRESHOLD_PERCENT = 50
export const SUCCESSOR_PREFIX = 'successor-'

// Tools the main session may still use once locked: enough to inspect state,
// load the deferred Solo tools, write the handoff and spawn the successor.
const ALLOWED_TOOLS = new Set(['Read', 'Grep', 'Glob', 'ToolSearch', 'Skill'])
const SOLO_TOOL = /^mcp__solo__/
const SPAWN_TOOL = 'mcp__solo__spawn_agent'
// Each segment of a locked Bash command must be one of these. `date` is here
// because handoff skills (auto-handoff's among them) timestamp their file.
const READ_ONLY_COMMAND = /^\s*(date\b|git\s+(status|log|diff|branch|rev-parse|show|worktree\s+list)\b)/
const COMMAND_SEPARATOR = /&&|\|\||;/
// A handoff skill writes its document somewhere named for it, e.g. docs/handoffs/.
const HANDOFF_PATH = /handoff/i

type Settings = { threshold: number; skill: string }

export const readSettings = (options: Record<string, unknown>): Settings => {
  const threshold = Number(options.threshold)

  return {
    threshold: threshold > 0 && threshold <= 100 ? threshold : DEFAULT_THRESHOLD_PERCENT,
    skill: String(options.skill ?? '').trim().replace(/^\//, ''),
  }
}

const writeStep = (skill: string) =>
  skill === ''
    ? '2. Write a handoff with mcp__solo__scratchpad_write: goal, done so far, in progress, exact next steps, ' +
      'locked user decisions, branches/worktrees/PRs, open risks.\n'
    : `2. Write the handoff by running the /${skill} skill with the Skill tool.\n`

export const handoffInstructions = (percent: number, { threshold, skill }: Settings) =>
  `Context is at ${percent}% (handoff limit ${threshold}%). Stop the current work and hand off now:\n` +
  '1. Load the Solo tools with ToolSearch if needed.\n' +
  writeStep(skill) +
  `3. Spawn the successor with mcp__solo__spawn_agent in the same project, with a name starting "${SUCCESSOR_PREFIX}". ` +
  'Then send it, via mcp__solo__send_input, a prompt under 300 bytes: read the handoff by id or path and continue from it.\n' +
  '4. Tell the user where the handoff is and the successor process id, then stop.\n' +
  'Only Read, Grep, Glob, ToolSearch, Skill, date, read-only git, writes to a handoff file and Solo tools work until then. ' +
  'Spawning any other agent is refused: no new delegates during a handoff.'

const isSuccessorSpawn = (name: unknown) => typeof name === 'string' && name.startsWith(SUCCESSOR_PREFIX)

const isReadOnlyCommand = (command: unknown) =>
  typeof command === 'string' && command.split(COMMAND_SEPARATOR).every(part => READ_ONLY_COMMAND.test(part))

const isAllowedWhileLocked = (tool: string, input: { command?: unknown; file_path?: unknown }) =>
  ALLOWED_TOOLS.has(tool) ||
  SOLO_TOOL.test(tool) ||
  (tool === 'Bash' && isReadOnlyCommand(input.command)) ||
  (tool === 'Write' && typeof input.file_path === 'string' && HANDOFF_PATH.test(input.file_path))

export const register: Register = (on, options) => {
  const settings = readSettings(options)
  let hasHandedOff = false
  let hasWarned = false

  on('session.measure', ($, e, next) => {
    const percent = e.context.percent ?? 0

    if (percent >= settings.threshold && !hasWarned) {
      hasWarned = true
      $.ui.toast(`Context ${percent}%: handing off to a successor session.`)
      $.ui.status(`handoff due (${percent}%)`)
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    // Subagents and engine forks run in their own windows; only the main loop hands off.
    if (e.agentId !== undefined) {
      return next(e)
    }

    if (hasHandedOff && !SOLO_TOOL.test(e.tool) && e.tool !== 'ToolSearch') {
      return {
        deny: 'You already spawned the successor. Only Solo tools work now: make sure it got its brief, then report to the user and stop.',
      }
    }

    const percent = (await $.session.usage()).context.percent ?? 0

    if (percent < settings.threshold) {
      return next(e)
    }

    const input = e as { command?: unknown; file_path?: unknown; name?: unknown }

    if (!isAllowedWhileLocked(e.tool, input)) {
      return { deny: handoffInstructions(percent, settings) }
    }

    const isSpawn = e.tool === SPAWN_TOOL

    if (isSpawn && !isSuccessorSpawn(input.name)) {
      return { deny: handoffInstructions(percent, settings) }
    }

    const ran = await next(e)

    if (isSpawn && ran.deny === undefined && ran.isError !== true) {
      hasHandedOff = true
      $.ui.status('handed off')
    }

    return ran
  }).catch(($, e, next) => next(e)) // fail open: a broken guard must never brick the session
}
