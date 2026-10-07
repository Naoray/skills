import { expect, test } from 'claude-code/testing'
import { SUCCESSOR_PREFIX, THRESHOLD_PERCENT } from './register'

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
  expect(ran.deny).toContain('mcp__solo__spawn_agent')
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
