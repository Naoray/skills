# Transport: Solo MCP + CLI

Use this guideline when the orchestrator is operating over [Solo MCP](https://github.com/sublayerapp/solo).

## Tool Selection (MCP vs CLI)

| Context | Tooling Preference | Why |
|---|---|---|
| **Inside Solo** | Solo MCP + `solo` CLI | MCP preserves parent/child routing and Pattern C callbacks. CLI used for chatty reads. |
| **Outside Solo** | `solo` CLI | Works when MCP is unavailable but the `solo` binary is on PATH. |

### MCP Tooling (Inside Solo)

| Operation | Tool |
|---|---|
| **Spawn Delegate** | `mcp__solo__spawn_agent(agent_tool_id=N, name="<slug>")` (Returns `agent_instructions`) |
| **Push Input** | `mcp__solo__send_input(process_id=PID, input="<brief>")` |
| **Identify Parent** | `mcp__solo__whoami()` (Required for worker-to-orchestrator push) |
| **Harvest Delegate** | `mcp__solo__close_process(process_id=PID)` (Removes process from Solo) |
| **List Agents** | `mcp__solo__list_agent_tools()` |

**Note on Spawn:** `spawn_agent` is preferred over `spawn_process(kind="agent")`. It returns `agent_instructions` (containing the child's Solo PID and MCP context); you **MUST** prepend this string to the delegate's first `send_input` so the child knows its own identity.

### CLI Tooling (Outside Solo / Chatty Reads)

Invoke via `ctx_shell` or `Bash`.

```bash
solo processes list --project-id <id> [--json]
solo processes spawn --project-id <id> --kind agent --agent-tool-id <id> --name <slug> --arg "<brief>"
solo processes get <pid> [--json]
solo processes stop <pid>
solo todos create --project-id <id> --title "<t>" --body "<b>"
solo scratchpads read <id> --project-id <id> --mode content
solo scratchpads create --project-id <id> --name <slug> --content <text>
```

## Pattern C Reporting Contract (Solo implementation)

Worker invokes `solo-orchestration`, writes to a `done/<task-slug>` scratchpad, and calls `mcp__solo__send_input` to the orchestrator's PID.

### Preamble to paste into every Solo brief:

```text
## Reporting contract (CRITICAL — do this first)

Pattern C is mandatory. Invoke the `solo-orchestration` skill immediately and apply Pattern C.

Orchestrator pid: <PID_FROM_whoami>.

On terminal event (DONE/BLOCKED/MERGED):
1. Print sentinel as final stdout line.
2. `solo scratchpads create --name done/<task-slug> --content <payload>` (CLI).
3. `mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <payload>. Scratchpad: done/<task-slug>"` (MCP).
```

## Surface Routing

| Surface | Tool | Purpose |
|---|---|---|
| **Solo scratchpad** | `solo scratchpads` | Working artefacts for next-step agents. |
| **Solo todo** | `solo todos` | Actionable work with criteria. |
| **MemPalace** | `mempalace` | Durable cross-session knowledge. |
| **Repo `docs/`** | `Write` / `replace` | Shipping artefacts. |
