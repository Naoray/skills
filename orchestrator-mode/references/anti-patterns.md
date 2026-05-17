# Anti-patterns

Accumulated lessons. Re-read at session start.

| Anti-pattern | Fix |
|---|---|
| Dispatched via Claude Code's in-process `Task` / `Agent` / `subagent_type` tool instead of Solo. | Forbidden in orchestrator-mode. In-process subagents share orchestrator context, can't run in anvil worktrees, can't be Pattern-C monitored, and silently collapse parallel work. ALL delegates must be spawned as Solo processes: `mcp__solo__spawn_process` when inside Solo, `solo processes spawn` (CLI, through ctx_shell) when outside Solo. If Solo isn't reachable: stop and report — don't fall back. |
| Used `solo processes spawn` from inside a Solo process. | Inside Solo, spawn via Solo MCP so child routing, parent identity, and Pattern C callbacks are preserved. Use CLI spawning only when orchestrating from outside Solo or when MCP tools are unavailable. |
| Used `mcp__solo__*` for a chatty read (list_processes, scratchpad_read, todo_list) when a `solo` CLI command exists. | Prefer CLI through `ctx_shell` for chatty reads — lean-ctx compresses the output. Keep MCP for inside-Solo process lifecycle, `whoami`, `list_agent_tools`, and `send_input`. |
| Harvested an agent by pausing/stopping it and leaving the Solo process entry around. | After terminal sentinel + artifact verification, remove the stored Solo agent/terminal with `mcp__solo__close_process`. Stop/pause is only a temporary fallback, not harvest completion. |
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
| Asked the user "should I act autonomously per the north star?" after consult.md returned a valid load. | The loaded artefact IS the autonomy contract. After a successful load, do not re-ask about scope or direction — proceed. Only escalate for items the north star explicitly does not cover (irreversible actions, new product fork, locked-decision conflicts). |
| Re-derived a north star inside a delegate brief because consult.md returned missing. | Delegates obey, do not author. On missing north star, the orchestrator (not the delegate) prompts the user once; delegate brief uses the "Not set" stanza. |
| North star drifted between `docs/NORTH_STAR.md` and the MemPalace drawer; orchestrator silently picked one. | consult.md's drift check must surface the diff and ask. Silent reconciliation poisons every downstream brief. Run `/north-star` refresh on drift detection. |
| Worker spawned in project A wrote its scratchpads + follow-up todos to project B (the orchestrator's project) because no explicit `project_id` directive was in the brief. | When dispatching cross-project, the brief MUST name the target project explicitly: `Write all scratchpads + todos with project_id=<TARGET>` and `Send sentinel back to orchestrator pid <PID> with project_id=<ORCH_PROJECT>`. Why: workers default scope leaks toward the channel they reply on; without the directive, artefacts land where the orchestrator lives, not where the work belongs. |
