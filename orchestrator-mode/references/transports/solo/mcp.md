# Transport: Solo (MCP)

Default guideline for orchestrators operating inside [Solo](https://github.com/sublayerapp/solo).

## MCP Tooling

| Operation | Tool |
|---|---|
| **Spawn Delegate** | `mcp__solo__spawn_agent(agent_tool_id=N, name="<slug>")` (Returns `agent_instructions`) |
| **Push Input** | `mcp__solo__send_input(process_id=PID, input="<brief>")` |
| **Identify Parent** | `mcp__solo__whoami()` (Required for worker-to-orchestrator push) |
| **Harvest Delegate** | `mcp__solo__close_process(process_id=PID)` (Removes process from Solo) |
| **List Agents** | `mcp__solo__list_agent_tools()` |

**Note on Spawn:** `spawn_agent` returns `agent_instructions`; you **MUST** prepend this string to the delegate's first `send_input` so the child knows its own identity.

### Dispatching Claude TUI delegates — park the brief, push a pointer

Large multiline briefs sent via `send_input` to a **Claude** TUI agent corrupt its input buffer: newlines fragment into unsent "queued messages", the render garbles, and the agent idles or derails. Reliable pattern:

1. Park the full brief in a Solo scratchpad: `mcp__solo__scratchpad_write name=brief/<task-slug> content=<full brief>`.
2. `send_input` a **single short line** pointing at it:
   `Call whoami() first, then read scratchpad_id=<N> (mcp__solo__scratchpad_read) and execute that brief in one pass.`
3. If a Claude agent is stuck with a `Press up to edit queued messages` buffer, flush it before respawning: `mcp__solo__send_input(process_id=PID, bytes=[13])` (raw Enter).

**Codex** tolerates big multiline `send_input` briefs — this workaround is Claude-TUI-specific.

For outside-Solo dispatch or chatty CLI reads, see [./cli.md](./cli.md).

## Pattern C Reporting Contract (Solo)

Worker invokes `solo-orchestration`, writes to a `done/<task-slug>` scratchpad, and calls `mcp__solo__send_input` to the orchestrator's PID.

### Preamble to paste into every Solo brief:

```text
## Reporting contract (CRITICAL — do this first)

Pattern C is mandatory. Invoke the `solo-orchestration` skill immediately and apply Pattern C.

Orchestrator pid: <PID_FROM_whoami>.

On terminal event (DONE/BLOCKED/MERGED):
1. Print sentinel as final stdout line.
2. Write durable record FIRST: `solo scratchpads create --name done/<task-slug> --content <payload>` (CLI) or `mcp__solo__scratchpad_write name=done/<task-slug>` (MCP).
3. THEN push the sentinel: `mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <one-line summary>. Scratchpad: done/<task-slug>"` (MCP).

Order is non-negotiable: `scratchpad_write` MUST happen before `send_input`. The durable record is the safety net — if the push is swallowed (e.g. by a blocking-UI modal on the orchestrator side), the scratchpad still records the terminal event for reconciliation.
```

## Surface Routing

| Surface | Tool | Purpose |
|---|---|---|
| **Solo scratchpad** | `solo scratchpads` | Working artefacts for next-step agents. |
| **Solo todo** | `solo todos` | Actionable work with criteria. |
| **MemPalace** | `mempalace` | Durable cross-session knowledge. |
| **Repo `docs/`** | `Write` / `replace` | Shipping artefacts. |
