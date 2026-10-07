import { expect, test } from 'claude-code/testing'
import { COMPLETE_TOOL, DEFAULT_THRESHOLD_PERCENT as THRESHOLD_PERCENT } from './register'

const usageAt = (percent: number) => () => ({
  value: { startedAt: 0, context: { window: 200_000, tokens: percent * 2_000, percent }, rateLimits: [] },
})

const answered = () => ({ result: 'ok' })

const edit = { tool: 'Edit', file_path: 'a.php', old_string: 'a', new_string: 'b' } as const

test('below the threshold every tool runs', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT - 1))
  on('tool.call', answered)

  expect((await $.tool.call(edit)).deny).toBeUndefined()
})

test('at the threshold work is refused with the built-in handoff steps', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call(edit)

  expect(ran.deny).toContain(`handoff limit ${THRESHOLD_PERCENT}%`)
  expect(ran.deny).toContain('docs/handoffs/')
  expect(ran.deny).toContain(COMPLETE_TOOL)
})

test('the built-in handoff can look around, timestamp and write its file', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  expect((await $.tool.call({ tool: 'Read', file_path: 'a.php' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Bash', command: 'date +%Y-%m-%d-%H%M; git status --short --branch' })).deny).toBeUndefined()
  expect((await $.tool.call({ tool: 'Write', file_path: 'docs/handoffs/x.md', content: 'x' })).deny).toBeUndefined()
})

test('once locked, other writes and commands are refused', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  expect((await $.tool.call({ tool: 'Write', file_path: 'src/a.php', content: 'x' })).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Bash', command: 'date; rm -rf build' })).deny).toBeDefined()
  expect((await $.tool.call({ tool: 'Bash', command: 'git push' })).deny).toBeDefined()
})

test('subagents are never locked', async ($, on) => {
  on('session.usage', usageAt(95))
  on('tool.call', answered)

  expect((await $.tool.call({ ...edit, agentId: 'sub-1' })).deny).toBeUndefined()
})

test('the threshold comes from the options', { options: { threshold: 30 } }, async ($, on) => {
  on('session.usage', usageAt(35))
  on('tool.call', answered)

  expect((await $.tool.call(edit)).deny).toContain('handoff limit 30%')
})

test('below a configured threshold nothing is locked', { options: { threshold: 30 } }, async ($, on) => {
  on('session.usage', usageAt(25))
  on('tool.call', answered)

  expect((await $.tool.call(edit)).deny).toBeUndefined()
})

test('a configured skill is named in the refusal', { options: { skill: '/solo-handoff' } }, async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  const ran = await $.tool.call(edit)

  expect(ran.deny).toContain('/solo-handoff skill')
  expect(ran.deny).not.toContain('docs/handoffs/')
})

test('starting the configured skill unlocks the tools it needs', { options: { skill: 'solo-handoff' } }, async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  await $.tool.call({ tool: 'Skill', skill: 'solo-handoff' })

  expect((await $.tool.call({ tool: 'mcp__solo__spawn_agent', agent_tool_id: 1 })).deny).toBeUndefined()
})

test('starting some other skill does not unlock', { options: { skill: 'solo-handoff' } }, async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT))
  on('tool.call', answered)

  await $.tool.call({ tool: 'Skill', skill: 'pest-testing' })

  expect((await $.tool.call(edit)).deny).toBeDefined()
})

test('after handoff_complete the session refuses everything', async ($, on) => {
  on('session.usage', usageAt(THRESHOLD_PERCENT - 10))
  on('tool.call', answered)

  const done = await $.tool.call({ tool: COMPLETE_TOOL, location: 'scratchpad 11491', successor: 'process 10169' })
  const read = await $.tool.call({ tool: 'Read', file_path: 'a.php' })

  expect(done.deny).toBeUndefined()
  expect(read.deny).toContain('scratchpad 11491, continued by process 10169')
})
