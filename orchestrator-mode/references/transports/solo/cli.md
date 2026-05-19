# Transport: Solo (CLI)

Use these patterns when orchestrating from outside Solo or when performing chatty reads that benefit from compression.

## CLI Tooling

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

Add `--json` only when you need structured parsing — human-output compresses better with lean-ctx.

For the default MCP-based workflow, see [./mcp.md](./mcp.md).
