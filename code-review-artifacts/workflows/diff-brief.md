# Diff Brief

Read `principles/risk.md` when judging findings.

## Steps

1. Run diff stat for the chosen base.
2. Read changed files that contain behavior, contracts, tests, or user-facing
   output.
3. Group changes by logical purpose rather than file order.
4. Identify review risks:
   - behavior changed without tests
   - new public API or config
   - new error path or missing error path
   - data migration or persistence change
   - security, auth, privacy, or money path
5. Produce a compact review brief.

## Output

```text
CODE REVIEW ARTIFACTS — Diff Brief

Inspected: <range/scope>
Not inspected: <scope gaps>

What changed:
- ...

Review focus:
- ...

Risk:
- High: ...
- Medium: ...
- Low: ...

Suggested next artifact:
- Flow map for <flow>, because <reason>
```
