# Flow Map

Read `references/principles/comprehension.md` before rendering diagrams.

## Steps

1. Identify changed functions, methods, handlers, commands, jobs, or workflows.
2. For each selected logical unit, read the full current implementation.
3. Read changed delegate functions that affect runtime behavior.
4. Compare with previous version when needed using a wide diff or `git show`.
5. Render one ASCII diagram per logical unit.

## Diagram Rules

- Show runtime order, not line-by-line code.
- Mark changed steps with `[NEW]`, `[MOD]`, or `[REMOVED]`.
- Show decisions and error paths explicitly.
- Keep diagrams top-to-bottom and under 80 columns when practical.
- Use plain-English labels.

## Output

```text
CODE REVIEW ARTIFACTS — Flow Map

Inspected: <range/scope>
Not inspected: <scope gaps>

Changed flows:
- <flow>: <why selected>

<diagram>

Key principle:
<one sentence explaining core design/correctness idea>
```

End by asking whether the diagram matches the user's mental model or whether a
specific path should be traced deeper.
