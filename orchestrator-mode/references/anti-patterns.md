# Anti-patterns

Accumulated lessons. Re-read at session start.

| Anti-pattern | Fix |
|---|---|
| Idle-timer fires on already-idle process (briefing finished before work started). | Pattern C push on terminal events. No idle timers. |
| Reviewer dispatched on a docs-only PR. | Docs-only merges directly; reviewer table guides. |
| Single-voice plan review marked "good enough." | Multi-reviewer brief (≥2 voices). Codex catches what Claude misses and vice-versa. |
| Worktrees pile up — 10+ stale, GB consumed. | Cleanup orchestrator-side after every merge + at session orient. |
| Sentinel forgotten in brief → orchestrator over-sleeps. | Reporting contract preamble is non-negotiable in every brief. |
| Hardcoded `agent_tool_id=N`. | Resolve at dispatch via `list_agent_tools`. |
| Re-using one agent PTY across multiple deliverables. | One agent per task. Spawn fresh. |
| Branch state assumed stale → wrong merge order claim. | `git fetch && git log origin/main..HEAD` before merge-order claims. |
| Lost executable bits on skill hooks after marketplace update. | `fix-plugin-permissions` skill. |
| `~/.claude/`, `~/.scribe/` paths refused by ctx_read (escapes project root). | Native `Read` or `ctx_shell`. |
