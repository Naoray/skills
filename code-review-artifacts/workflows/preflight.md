# Preflight

1. Identify request intent: diff brief, flow map, or x-ray.
2. Identify scope: current branch, commit range, PR, file, function, route, CLI
   command, or whole codebase.
3. Check git state with compact status output.
4. Choose comparison base:
   - explicit base from user if provided
   - PR base if working on a PR
   - `origin/main` if available
   - `HEAD~1` only for a single recent commit
5. State scope before deep tracing:

```text
Inspecting: <scope>
Base: <base>
Mode: <mode>
Will not inspect: <out-of-scope areas>
```

Do not ask for confirmation unless the scope is ambiguous enough to cause wrong
work.
