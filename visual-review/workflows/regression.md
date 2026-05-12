# Regression

Read `references/principles/visual-qa.md`.

## Purpose

Compare before/after rendered output and report meaningful visual differences.

## Steps

1. Capture or locate before artifacts.
2. Capture after artifacts with same route, command, viewport, and state.
3. Compare for:
   - missing content
   - layout shift
   - overflow or clipping
   - changed hierarchy
   - broken responsive behavior
   - terminal wrapping changes
4. Ignore expected differences named by the user.

## Output

```text
VISUAL REVIEW — Regression

Compared:
- Before: <path>
- After: <path>

Differences:
- Expected: ...
- Unexpected: ...

Verdict:
- Pass / Needs changes / Inconclusive
```
