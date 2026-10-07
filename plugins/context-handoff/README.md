# context-handoff

A Claude Code plugin (function hooks) that makes a long session hand off before it gets expensive. Every turn re-sends the whole conversation, so a session that keeps growing pays for its history again on each step.

The plugin only decides **when** to hand off. **How** is up to a handoff skill you choose, so it works in any environment.

## What it does

- **Below the threshold (default 50% context used):** nothing. The check reads the status line's figures and costs nothing.
- **At the threshold:** a toast and status line warn you, and the main session is locked. It may look around (`Read`, `Grep`, `Glob`, `ToolSearch`), run `date` and read-only `git`, write a file whose path contains `handoff`, and start a skill. Everything else is refused with the handoff instructions.
- **With a `skill` configured,** starting that skill unlocks the session, so the skill can use whatever tools its handoff needs.
- **Without one,** the session writes `docs/handoffs/<timestamp>-<slug>.md` and tells you to continue in a fresh session.
- **The handoff ends with the plugin's `handoff_complete` tool**, which records where the handoff is and who continues. After that the session refuses every tool, so it stops spending. This is kept for the session, so a plugin reload or update never starts a second handoff.
- **Subagents are never locked**, and the guard fails open: if the context check itself breaks, the session carries on.

## Options

Set them when you install, or later under `/plugin`:

- **`threshold`** (default `50`): share of the context window used at which the session locks.
- **`skill`** (default empty): the skill the session runs to hand off, without its slash. It should finish by calling `mcp__context-handoff__handoff_complete` with `location` (and `successor`, when one exists).

For Solo, use the [`solo-handoff`](../../solo-handoff/SKILL.md) skill from this repo: it writes the handoff, spawns a successor session, redirects running agents to it and calls `handoff_complete`.

## Install

```text
/plugin marketplace add Naoray/skills
/plugin install context-handoff@naoray-skills
```

## Caveats

- **The threshold is a share of the model's window.** On a 1M-token window, 50% is about 500k tokens. Lower `threshold` to hand off sooner.
- **The status line's `ctx:` figure may show free context, not used context.** Check what yours shows before reading it against the threshold.
- **A configured skill is trusted once started.** The plugin unlocks the session for it; the skill is responsible for finishing with `handoff_complete`.

## Develop

```bash
claude plugin validate plugins/context-handoff
claude plugin test plugins/context-handoff
```
