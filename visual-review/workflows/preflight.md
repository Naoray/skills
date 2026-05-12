# Preflight

1. Identify target:
   - PR number
   - local URL/route
   - command
   - TUI workflow
   - before/after pair
2. Identify environment:
   - current checkout for ad-hoc review
   - Anvil worktree for PR review when isolation is needed
3. Identify artifact directory:
   - web: `/tmp/visual-review/<id>/`
   - cli: `/tmp/cli-visual-review/<id>/`
4. Confirm any command that could mutate data before running it.
5. State scope:

```text
Visual review target: <target>
Mode: <web|cli|regression>
Artifacts: <directory>
Will inspect: <routes/commands/states>
Will not inspect: <scope gaps>
```

Do not install tools without asking once.
