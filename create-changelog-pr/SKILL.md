---
name: create-changelog-pr
description: Create a pull request with a [Keep a Changelog](https://keepachangelog.com) formatted description based on the diff between source and target branches.
---

# Create Changelog PR

Create a pull request with a [Keep a Changelog](https://keepachangelog.com) formatted description based on the diff between source and target branches.

## Usage

```
/create-changelog-pr [source] [target]
```

- `source`: the branch to merge from (default: current branch or `staging`)
- `target`: the branch to merge into (default: `main`)

If no arguments are provided, infer reasonable defaults from context (e.g. current branch → `main`, or `staging` → `main`).

## Instructions

### Step 1: Determine Branches

1. Parse any arguments passed to the skill for `source` and `target` branch names.
2. If not specified, use these defaults:
   - `source`: the current branch (from `git branch --show-current`), or `staging` if on `main`/detached
   - `target`: `main`

### Step 2: Detect the merge workflow

Run:
```bash
git log {target}..{source} --format="%s" | head -30
```

**Squash merge detection**: If most commits match the pattern `Some description (#NNN)`, the branch uses squash merges. This is the critical case — **do not use `git log target..source` to determine what is new**, because squash-merging collapses feature commits to a new SHA on `{target}`, so git ancestry checks always report staging's full history as "not in target" even when it has already shipped.

#### Squash merge workflow (most commits have `#NNN`)

**Step 2a — Find the last release merged to `{target}`:**
```bash
gh pr list --repo {owner}/{repo} --base {target} --state merged --limit 3 --json number,title,body,mergedAt
```
Identify the most recent release/changelog PR (title often starts with `feat:`, `fix:`, or `Release:`). Note its `mergedAt` timestamp and its `number`.

**Step 2b — Find PRs merged to `{source}` after that release:**
```bash
gh pr list --repo {owner}/{repo} --base {source} --state merged --json number,title,mergedAt \
  | jq '[.[] | select(.mergedAt > "{LAST_RELEASE_MERGED_AT}")]'
```
This gives the PRs that landed on `{source}` after the last release — these are the candidates for the changelog.

**Step 2c — Exclude PRs already covered by the last release:**
Parse the last release PR's body for `(#NNN)` references — those PRs were already shipped. Remove them from the candidate list.

**Step 2d — Fetch each qualifying PR's description:**
```bash
gh api repos/{owner}/{repo}/pulls/{pr-number} --jq '{title: .title, body: .body}'
```
Use the PR descriptions as the primary source for changelog entries — they contain the structured summaries, affected areas, and context that squash commit messages lose.

#### Non-squash workflow

Filter out bare merge commits (those whose subject starts with `Merge`). For each real commit, retrieve its full body:
```bash
git log {target}..{source} --format="%s%n%b" | grep -v "^$"
```

Also get the diff stat for context:
```bash
git diff {target}...{source} --stat
```

### Step 3: Categorise Changes

Map each commit into the appropriate Keep a Changelog section based on its conventional commit prefix or content:

| Commit prefix | Changelog section |
|---|---|
| `feat:` / `feature:` | **Added** |
| `fix:` | **Fixed** |
| `refactor:` | **Changed** |
| `chore:` | **Changed** |
| `perf:` | **Changed** |
| `docs:` | **Changed** |
| `test:` | **Changed** |
| `security:` | **Security** |
| `deprecated:` | **Deprecated** |
| `remove:` / `removed:` | **Removed** |
| Breaking changes (BREAKING CHANGE in body) | **Changed** (with ⚠️ prefix) |

Only include sections that have entries. Do not include empty sections.

### Step 4: Write Changelog Entries

For each commit, write a concise changelog entry:
- Start with a **bold summary** — human-readable, not the raw commit subject
- Add a brief explanation of *why* the change was made or what problem it solves
- Include issue/PR references where available (e.g. `(#123)`)
- Strip `Co-Authored-By` lines, internal tooling notes, and implementation details unless they matter to the reader

Example:
```markdown
### Fixed

- **PaymentInfo nested Data hydration TypeError** (#2277) — Livewire's `FormObjectSynth` passes a no-op callback during property updates, causing nested objects to arrive as plain arrays. Fixed by accepting a union type and converting in `boot()`.
```

### Step 5: Derive a PR Title

Before creating the PR, synthesise a concise, human-readable title from the changelog entries. The title should:

- Summarise the **dominant theme(s)** of the release in plain English (not branch names)
- Lead with the primary category if clear (e.g. "fix:", "feat:"), or omit a prefix when the release is mixed
- Be no longer than ~70 characters
- List up to three key topics separated by ` & ` or `,` when the release is diverse

Examples:
- `fix: upload flow reliability, artist pagination & Nova actions`
- `feat: artist onboarding flow & payment info step`
- `Release: upload reliability, enum normalisation & pagination fixes`

Do **not** use `"Release: {source} → {target}"` as the title.

### Step 6: Create the PR

Run:
```bash
gh pr create \
  --base {target} \
  --head {source} \
  --title "{derived title}" \
  --body "..."
```

The body should follow this structure:

```markdown
## Changelog

All notable changes in this release.

### Added

- ...

### Fixed

- ...

### Changed

- ...

### Removed

- ...

### Security

- ...

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Only include sections with actual entries.

### Step 7: Output

Return the PR URL to the user.
