# Create PR Body

Read `references/principles/changelog.md`.

## Steps

1. Determine changed items:
   - For squash-merge repositories, use merged PRs since the last release PR
     merged to the target branch.
   - For regular repositories, use commits in `{target}..{source}` and diff stat
     from `{target}...{source}`.
2. Fetch full PR bodies or commit bodies for context.
3. Categorize entries using Keep a Changelog sections.
4. Write concise user-facing entries.
5. Derive a PR title from dominant release themes.
6. If user requested creation, run `gh pr create`; otherwise present title/body.

## Body Template

```markdown
## Changelog

All notable changes in this release.

### Added

- ...

### Fixed

- ...

### Changed

- ...
```

Only include sections with entries.

## Output

Return generated title, generated body, source/target, and PR URL if created.
