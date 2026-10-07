# context-handoff

A Claude Code plugin (function hooks) that hands a long session off to a fresh one before it gets expensive. Every turn re-sends the whole conversation, so a session that keeps growing pays for its history again on each step.

## What it does

- **Below the threshold (default 50% context used):** nothing. The check reads the status line's figures and costs nothing.
- **At the threshold:** a toast and status line warn you, and the main session is locked to handoff work. Every other tool call is refused with one instruction: run the handoff skill.
- **The bundled `solo-handoff` skill does the transfer:**
  1. Writes the handoff to a Solo scratchpad (via `orchestrator-handoff` when the session orchestrates agents).
  2. Spawns the successor with `mcp__solo__spawn_agent`, named `successor-…`, and briefs it with a short pointer.
  3. Tells every running agent to report to the successor from now on, and hands over its timers.
  4. Reports the scratchpad, the successor and the redirected agents, then stops.
- **While locked, only handoff work runs:** `Read`, `Grep`, `Glob`, `ToolSearch`, `Skill`, `date`, read-only `git` and `gh`, MemPalace lookups, writes to a file whose path contains `handoff`, and Solo tools. Spawning any agent not named `successor-…` is refused, so no new delegates start during a handoff.
- **After the successor spawn,** only Solo tools still run, so the old session can brief, redirect and clean up. This is remembered for the session, so a plugin reload or update never starts a second handoff.
- **Only Solo sessions lock.** Outside Solo (no `SOLO_PROCESS_ID`) nothing could spawn a successor, so the plugin only shows a toast suggesting `/compact` or a fresh session.
- **Subagents are never locked**, and the guard fails open: if the context check itself breaks, the session carries on.

## Options

Set them when you install, or later under `/plugin`:

- **`threshold`** (default `50`): share of the context window used at which the session locks.
- **`skill`** (default `context-handoff:solo-handoff`): the skill the session runs to hand off, without its slash. Name your own to replace the bundled one; it must spawn its successor with a name starting `successor-`.

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
- **The old session stays open** after the handoff, in case a late report reaches it; it forwards those to the successor. Close it once the redirected agents have reported.
- **The status line's `ctx:` figure may show free context, not used context.** Check what yours shows before reading it against the threshold.

## Develop

```bash
claude plugin validate plugins/context-handoff
claude plugin test plugins/context-handoff
```
