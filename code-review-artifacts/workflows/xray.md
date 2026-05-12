# X-Ray

Read `references/principles/comprehension.md` and `references/principles/risk.md`.

## Purpose

Show how a codebase or feature area works across entry points, then evaluate the
flows for structural risk.

## Steps

1. Discover user-facing entry points:
   - CLI commands
   - HTTP routes/controllers
   - jobs, listeners, schedules
   - webhooks
   - TUI/application entry points
2. Scope the run:
   - changed flows since chosen base, or
   - user-specified feature area, or
   - all discovered flows for small codebases
3. For each selected flow:
   - trace from input to output
   - include decisions, errors, external calls, and side effects
   - render an ASCII diagram
4. Evaluate diagrammed flows for:
   - dead ends
   - missing error paths
   - wrong-direction coupling
   - repeated shared chunks
   - unnecessary pass-through layers
   - data crossing trust boundaries

## Output

```text
CODE REVIEW ARTIFACTS — X-Ray

Inspected: <entry points / scope>
Not inspected: <scope gaps>

Flows:
- <name>: <summary>

<diagrams>

Findings:
- High: ...
- Medium: ...
- Low: ...

Next choices:
- Trace remaining flows
- Fix specific finding
- Stop here
```

Do not persist diagrams or metadata unless user asks for durable docs.
