# Preflight

1. Identify mode: create PR body, refresh PR body, or update changelog file.
2. Identify source and target:
   - explicit branches if supplied
   - current branch to `main` by default
   - `staging` to `main` when current branch is `main` and staging exists
3. Identify repository and PR context:
   - `gh repo view --json nameWithOwner`
   - current branch
   - existing PR if refreshing
4. Detect merge style with recent commit subjects and PR history.
5. State scope before writing:

```text
Changelog mode: <mode>
Source: <source>
Target: <target>
Merge style: <squash|regular|unknown>
Will write: <PR body|CHANGELOG.md|nothing yet>
```

Ask before creating PRs or editing files unless user explicitly requested apply.
