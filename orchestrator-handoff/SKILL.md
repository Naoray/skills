---
name: orchestrator-handoff
description: Generate a handoff prompt for a new orchestrator session. Captures in-flight agents, active scratchpads, pending user decisions, locked design decisions, open PRs + issues, and next-wave dispatch intent. Writes output to solo scratchpad `handoff/<project>-<date>` and surfaces the prompt for the user to copy into a fresh orchestrator.
---

# Orchestrator Handoff

Generate a handoff prompt when:
- User signals session-switch intent ("time for a handoff", "start a new orchestrator").
- Context window budget getting tight.
- In-flight work spans hours and benefits from a fresh PTY.

## What the handoff captures

Pull from three sources + synthesize into one prompt:

1. **Solo state** — `list_processes`, `todo_list completed=false`, `scratchpad_list`, open timers.
2. **Git/PR state** — `gh pr list`, `gh issue list`, `git log` on active branches.
3. **MemPalace durable memory** — `mempalace_search wing=<project>` for locked decisions, north star, rulebooks, drawers recorded this session.

## Output format

Write a scratchpad `handoff/<project-slug>-<YYYY-MM-DD>` with structure:

### Required sections

- **Session snapshot** — date, orchestrator pid (will change in new session), what was shipped today.
- **In-flight agents** — list of running solo process IDs + what they're doing + how to harvest them.
- **Active timers** — pending idle-timers on which processes.
- **Open PRs** — per-PR: URL, state, who needs to act, link to review scratchpad.
- **Open decisions** — user-facing questions queued, with options + orchestrator's lean.
- **Locked decisions (last 24h)** — with MemPalace drawer IDs for depth.
- **Active scratchpads** — which ones new orchestrator should preserve vs. can archive.
- **Next intended wave** — what the orchestrator would dispatch next if it continued.

### Optional sections (include when relevant)

- North star / project compass (cite drawer ID — don't duplicate content).
- Calibration data reference (task runtimes, reviewer reliability).
- Adopter context (who the users are, what they're waiting on).

## Process

1. Query `mcp__solo__whoami` for orchestrator pid.
2. Run state queries in parallel — `list_processes`, `todo_list`, `scratchpad_list`, `gh pr list`, `gh issue list`, `mempalace_search`.
3. Synthesize. Do NOT dump raw tool output — summarize.
4. Write scratchpad `handoff/<slug>`.
5. Print the consumable prompt — a condensed instruction the user pastes into a new Claude Code session that starts with `/orchestrator-mode` + `/solo-orchestration` invocation + references the handoff scratchpad.

## Rules

- Handoff is a READ-ONLY synthesis. Do not stop in-flight agents. Do not archive scratchpads. Do not close processes.
- Don't echo MemPalace drawer contents into the scratchpad — just reference the drawer IDs. Keeps scratchpad small + durable.
- Handoff scratchpad naming: `handoff/<project-slug>-<YYYY-MM-DD>`. If more than one per day, append `-hhmm`.

## Example trigger invocation

User says: "time for a handoff" → orchestrator invokes this skill → produces scratchpad + prints 400-word prompt → user copies prompt into a fresh orchestrator session.
