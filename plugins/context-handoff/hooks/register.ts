import type { Register } from 'claude-code'

export const THRESHOLD_PERCENT = 50

// Tools the main session may still use once locked: enough to inspect state,
// load the deferred Solo tools, write the handoff and spawn the successor.
const ALLOWED_TOOLS = new Set(['Read', 'Grep', 'Glob', 'ToolSearch', 'Skill'])
const SOLO_TOOL = /^mcp__solo__/
const SPAWN_TOOL = 'mcp__solo__spawn_agent'
export const SUCCESSOR_PREFIX = 'successor-'
const READ_ONLY_GIT = /^\s*git\s+(status|log|diff|branch|rev-parse|show|worktree\s+list)\b/

export const handoffInstructions = (percent: number) =>
  `Context is at ${percent}% (handoff limit ${THRESHOLD_PERCENT}%). Stop the current work and hand off now:\n` +
  '1. Load the Solo tools with ToolSearch if needed.\n' +
  '2. Write a handoff with mcp__solo__scratchpad_write: goal, done so far, in progress, exact next steps, ' +
  'locked user decisions, branches/worktrees/PRs, open risks.\n' +
  `3. Spawn the successor with mcp__solo__spawn_agent in the same project, with a name starting "${SUCCESSOR_PREFIX}". ` +
  'Then send it, via mcp__solo__send_input, a prompt under 300 bytes: read the handoff scratchpad by id and continue from it.\n' +
  '4. Tell the user the scratchpad id and the successor process id, then stop.\n' +
  'Only Read, Grep, Glob, ToolSearch, Skill, read-only git and Solo tools work until then. ' +
  'Spawning any other agent is refused: no new delegates during a handoff.'

const isSuccessorSpawn = (name: unknown) => typeof name === 'string' && name.startsWith(SUCCESSOR_PREFIX)

const isAllowedWhileLocked = (tool: string, command: unknown) =>
  ALLOWED_TOOLS.has(tool) ||
  SOLO_TOOL.test(tool) ||
  (tool === 'Bash' && typeof command === 'string' && READ_ONLY_GIT.test(command))

export const register: Register = on => {
  let hasHandedOff = false
  let hasWarned = false

  on('session.measure', ($, e, next) => {
    const percent = e.context.percent ?? 0

    if (percent >= THRESHOLD_PERCENT && !hasWarned) {
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

    if (percent < THRESHOLD_PERCENT) {
      return next(e)
    }

    if (!isAllowedWhileLocked(e.tool, (e as { command?: unknown }).command)) {
      return { deny: handoffInstructions(percent) }
    }

    const isSpawn = e.tool === SPAWN_TOOL

    if (isSpawn && !isSuccessorSpawn((e as { name?: unknown }).name)) {
      return { deny: handoffInstructions(percent) }
    }

    const ran = await next(e)

    if (isSpawn && ran.deny === undefined && ran.isError !== true) {
      hasHandedOff = true
      $.ui.status('handed off')
    }

    return ran
  }).catch(($, e, next) => next(e)) // fail open: a broken guard must never brick the session
}
