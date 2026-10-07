# context-handoff

A Claude Code plugin (function hooks) that hands a long session off to a fresh one before it gets expensive. Every turn re-sends the whole conversation, so a session that keeps growing pays for its history again on each step.

## What it does

- **Below 50% context used:** nothing. The check reads the status line's figures and costs nothing.
- **At 50%:** a toast and status line warn you, and the main session is locked to handoff work. Only `Read`, `Grep`, `Glob`, `ToolSearch`, `Skill`, read-only git (`status`, `log`, `diff`, `branch`, `rev-parse`, `show`, `worktree list`) and Solo MCP tools run. Every other call is refused with the handoff steps:
  1. Write a handoff to a Solo scratchpad.
  2. Spawn the successor with `mcp__solo__spawn_agent`, named `successor-…`.
  3. Send it a short pointer to the scratchpad with `mcp__solo__send_input`.
  4. Report the scratchpad and successor ids, then stop.
- **While locked, spawning any agent not named `successor-…` is refused**, so no new delegates start during a handoff.
- **After the successor spawn,** only Solo tools still run, so the old session can brief the successor and clean up.
- **Subagents are never locked**, and the guard fails open: if the context check itself breaks, the session carries on.

## Requirements

- Claude Code with function-hook plugins (2.1.29x or newer).
- [Solo](https://soloterm.com) with its MCP server connected, so the session can write scratchpads and spawn agents.

## Install

```text
/plugin marketplace add Naoray/skills
/plugin install context-handoff@naoray-skills
```

## Caveats

- **The threshold is a share of the model's window.** On a 1M-token window, 50% is about 500k tokens. Change `THRESHOLD_PERCENT` in `hooks/register.ts` to tune it.
- **The status line's `ctx:` figure may show free context, not used context.** Check what yours shows before reading it against the threshold.

## Develop

```bash
claude plugin validate plugins/context-handoff
claude plugin test plugins/context-handoff
```
