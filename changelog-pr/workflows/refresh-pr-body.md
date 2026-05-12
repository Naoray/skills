# Refresh PR Body

Read `principles/changelog.md`.

## Steps

1. Find existing PR for the source branch.
2. Read current PR title and body.
3. Generate updated changelog content using `workflows/create-pr-body.md`.
4. Preserve manual sections outside the generated changelog block.
5. Show a diff of the body update before applying unless user explicitly asked
   to update directly.
6. Apply with `gh pr edit --body-file <file>` when approved or explicitly asked.

## Preservation Rules

- Keep reviewer notes, rollout notes, checklist items, and manual warnings.
- Replace stale generated changelog sections.
- Do not remove issue links unless they are no longer part of the release.

## Output

Report PR URL, sections changed, sections preserved, and any uncertainty.
