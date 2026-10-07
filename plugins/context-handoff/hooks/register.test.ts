import { expect, test } from 'claude-code/testing'
import { DEFAULT_SKILL, DEFAULT_THRESHOLD_PERCENT as THRESHOLD_PERCENT, SUCCESSOR_PREFIX } from './register'

const usageAt = (percent: number) => () => ({
  value: { startedAt: 0, context: { window: 200_000, tokens: percent * 2_000, percent }, rateLimits: [] },
})

const answered = () => ({ result: 'ok' })

test('below the threshold every tool runs', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT - 1))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toBeUndefined()
})

test('at the threshold work tools are denied with handoff instructions', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toBeDefined()
  expect(ran.deny).toContain(SUCCESSOR_PREFIX)
})

test('at the threshold read, git status and Solo tools still run', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT + 10))
  on('tool.call', answered)

  expect((await $.tool.call({ tool: 'Read', file_path: 'a.php' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Bash', command: 'git status' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'mcp__solo__scratchpad_write', name: 'h', content: 'x' })).deny).toBeUndefined()
})

test('a mutating bash command is denied once locked', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Bash', command: 'git push' })

  expect(ran.deny).toBeDefined()
})

test('subagents are never locked', async ($, on) => {
  on('session.usage', usageAt(95))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', agentId: 'sub-1', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toBeUndefined()
})

test('once locked, spawning a delegate is refused and does not count as the handoff', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const spawn = await $.tool.call({ tool: 'mcp__solo__spawn_agent', agent_tool_id: 2, name: 'fu-4621-group' })
  const write = await $.tool.call({ tool: 'mcp__solo__scratchpad_write', name: 'h', content: 'x' })

  expect(spawn.deny).toBeDefined()
  expect(write.deny).toBeUndefined()
})

test('after the successor spawn only Solo tools still run', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  await $.tool.call({ tool: 'mcp__solo__spawn_agent', agent_tool_id: 1, name: `${SUCCESSOR_PREFIX}orchestrator` })
  const read = await $.tool.call({ tool: 'Read', file_path: 'a.php' })
  const brief = await $.tool.call({ tool: 'mcp__solo__send_input', process_id: 1, input: 'read scratchpad 1' })

  expect(read.deny).toContain('already spawned the successor')
  expect(brief.deny).toBeUndefined()
})

test('an empty skill option falls back to the bundled solo-handoff skill', { options: { skill: '' } }, async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toContain(`/${DEFAULT_SKILL} skill`)
  expect(ran.deny).toContain(`handoff limit ${THRESHOLD_PERCENT}%`)
})

test('the threshold comes from the options', { options: { threshold: 30 } }, async ($, on) => {
  on('session.usage', usageAt(35))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toContain('handoff limit 30%')
})

test('below a configured threshold nothing is locked', { options: { threshold: 30 } }, async ($, on) => {
  on('session.usage', usageAt(25))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toBeUndefined()
})

test('a configured skill replaces the scratchpad step', { options: { skill: '/auto-handoff:handoff' } }, async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call({ tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' })

  expect(ran.deny).toContain('/auto-handoff:handoff skill')
  expect(ran.deny).not.toContain(DEFAULT_SKILL)
})

test('a handoff skill can timestamp and write its file once locked', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const stamp = await $.tool.call({ tool: 'Bash', command: 'date +%Y-%m-%d-%H%M; git status --short --branch' })
  const note = await $.tool.call({ tool: 'Write', file_path: 'docs/handoffs/2026-10-07-x.md', content: 'x' })
  const code = await $.tool.call({ tool: 'Write', file_path: 'src/a.php', content: 'x' })
  const chained = await $.tool.call({ tool: 'Bash', command: 'date; rm -rf build' })

  expect(stamp.deny).toBeUndefined()
  expect(note.deny).toBeUndefined()
  expect(code.deny).toBeDefined()
  expect(chained.deny).toBeDefined()
})

test('orchestrator-handoff can read PRs and memory once locked', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const prs = await $.tool.call({ tool: 'Bash', command: 'gh pr list --author @me' })
  const memory = await $.tool.call({ tool: 'mcp__plugin_mempalace_mempalace__mempalace_search', query: 'x' })
  const merge = await $.tool.call({ tool: 'Bash', command: 'gh pr merge 12' })
  const remember = await $.tool.call({ tool: 'mcp__plugin_mempalace_mempalace__mempalace_add_drawer', content: 'x' })

  expect(prs.deny).toBeUndefined()
  expect(memory.deny).toBeUndefined()
  expect(merge.deny).toBeDefined()
  expect(remember.deny).toBeDefined()
})
