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
2. `solo scratchpads create --name done/<task-slug> --content <payload>` (CLI).
3. `mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <one-line summary>. Scratchpad: done/<task-slug>"` (MCP).
```

## Surface Routing

| Surface | Tool | Purpose |
|---|---|---|
| **Solo scratchpad** | `solo scratchpads` | Working artefacts for next-step agents. |
| **Solo todo** | `solo todos` | Actionable work with criteria. |
| **MemPalace** | `mempalace` | Durable cross-session knowledge. |
| **Repo `docs/`** | `Write` / `replace` | Shipping artefacts. |
