# Update Changelog File

Read `references/principles/changelog.md`.

## Steps

1. Find last release tag:

```bash
git describe --tags --abbrev=0
```

If no tags exist, use the initial commit.

2. Read commits since the last release.
3. Read existing `CHANGELOG.md` if present.
4. Ensure `[Unreleased]` exists.
5. Add missing user-facing entries under appropriate sections.
6. Skip commits already captured by existing entries.
7. Present proposed entries before writing unless user explicitly requested apply.

## Output

```text
CHANGELOG UPDATE

Range: <tag>..HEAD
Entries added:
- Added: ...
- Fixed: ...

Skipped:
- <internal/no-user-impact/already-covered>
```
