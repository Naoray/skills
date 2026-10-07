# context-handoff

A Claude Code plugin (function hooks) that hands a long session off to a fresh one before it gets expensive. Every turn re-sends the whole conversation, so a session that keeps growing pays for its history again on each step.

## What it does

- **Below the threshold (default 50% context used):** nothing. The check reads the status line's figures and costs nothing.
- **At the threshold:** a toast and status line warn you, and the main session is locked to handoff work. Only `Read`, `Grep`, `Glob`, `ToolSearch`, `Skill`, read-only git (`status`, `log`, `diff`, `branch`, `rev-parse`, `show`, `worktree list`) and Solo MCP tools run. Every other call is refused with the handoff steps:
  1. Write a handoff: a Solo scratchpad, or the handoff skill you configured.
  2. Spawn the successor with `mcp__solo__spawn_agent`, named `successor-…`.
  3. Send it a short pointer to the scratchpad with `mcp__solo__send_input`.
  4. Report the scratchpad and successor ids, then stop.
- **While locked, spawning any agent not named `successor-…` is refused**, so no new delegates start during a handoff.
- **After the successor spawn,** only Solo tools still run, so the old session can brief the successor and clean up.
- **Subagents are never locked**, and the guard fails open: if the context check itself breaks, the session carries on.

## Options

Set them when you install, or later under `/plugin`:

- **`threshold`** (default `50`): share of the context window used at which the session locks.
- **`skill`** (default empty): the skill the session runs to write the handoff, without its slash, for example `auto-handoff:handoff`. Empty means a Solo scratchpad.

While locked, the session may also run `date` and write files whose path contains `handoff`, so a handoff skill can timestamp and save its document.

## Requirements

- Claude Code with function-hook plugins (2.1.29x or newer).
- [Solo](https://soloterm.com) with its MCP server connected, so the session can write scratchpads and spawn agents.

## Install

```text
/plugin marketplace add Naoray/skills
/plugin install context-handoff@naoray-skills
```

## Caveats

- **The threshold is a share of the model's window.** On a 1M-token window, 50% is about 500k tokens. Lower `threshold` to hand off sooner.
- **Running delegates still report to the old session.** It stays open after the handoff; forward their reports to the successor, or let the successor read their Solo todos.
- **The status line's `ctx:` figure may show free context, not used context.** Check what yours shows before reading it against the threshold.

## Develop

```bash
claude plugin validate plugins/context-handoff
claude plugin test plugins/context-handoff
```
