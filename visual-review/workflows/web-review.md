# Web Review

Read `principles/visual-qa.md`.

## Setup

For PR review, use an isolated Anvil worktree when available. Do not switch the
user's current checkout branch.

For local review, use the current running dev server or start the app only when
the project conventions are clear.

## Steps

1. Identify changed pages from routes, controllers, views, CSS, components, or
   user-provided URLs.
2. Identify required states:
   - default
   - empty
   - loading/error when easy to reach
   - authenticated when relevant
   - locale variants when the app supports them
3. Capture screenshots at desktop and mobile viewports when responsive behavior
   matters.
4. Check browser console errors.
5. Open screenshots for inspection and include artifact paths in the report.

## Preferred Tools

- Use project-standard browser automation if present.
- Use `dev-browser` when available in the user's environment.
- Use Playwright only when project already has it or user asks.

## Output

```text
VISUAL REVIEW — Web

Inspected:
- Route/state/viewport: screenshot path

Findings:
- High: visible breakage, overlap, unreadable text, missing content
- Medium: responsive issue, weak hierarchy, inconsistent state
- Low: polish issue

Console errors:
- ...

Not inspected:
- ...
```
