---
name: visual-review-cli
description: Use when asked to visually review CLI output, screenshot terminal commands, capture TUI recordings, or QA a CLI tool's appearance. Captures static output as PNG via termshot and interactive TUI sessions as GIF via vhs. Supports PR-based review in anvil worktrees and ad-hoc single-command capture.
---

# Visual Review CLI

Visual QA for CLI tools. Captures terminal output as PNG screenshots (termshot) and
TUI interactions as GIF recordings (vhs). Two modes: PR review in anvil worktrees,
and ad-hoc single-command capture.

## When to Use

- User asks to visually review CLI changes in a PR
- User wants screenshots of terminal command output
- User wants to capture/record a TUI interaction
- User asks to "screenshot scribe list" or similar CLI commands

## Tool Check

Before capturing, verify tools are installed:

```bash
which termshot   # Static command output -> PNG
which vhs        # TUI/interactive -> GIF + PNG
```

If missing, ask user once then install:
```bash
brew install termshot
brew install charmbracelet/tap/vhs
```

Only install `vhs` if TUI files are detected in the diff.

## Mode 1: PR Review

**Trigger:** `/visual-review-cli 42` or "visually review CLI changes in PR #42"

### Phase 1: Setup

1. Fetch PR details:
   ```bash
   gh pr view <number> --json title,headRefName,baseRefName,body,url
   ```

2. Create anvil worktree via the anvil agent: `anvil work <branch-name>`

3. Detect build system and build:
   - `go.mod` -> `go build ./...`
   - `Cargo.toml` -> `cargo build`
   - `package.json` with `bin` -> `npm run build`
   - `Makefile` -> `make`
   - Fallback: ask user

### Phase 2: Command Discovery

1. Get changed files: `git diff <base>...HEAD --name-only`

2. Categorize:
   - `cmd/**/*.go` -> Cobra commands, extract name from `Use:` field
   - Files importing `tea.Model` -> TUI components, flag for VHS
   - `internal/**/*.go` (non-UI) -> check if referenced by commands
   - `--help` text changes -> flag those commands

3. Build command list with capture method:
   ```
   scribe sync      [TUI - vhs]
   scribe list      [static - termshot]
   scribe --help    [static - termshot]
   ```

4. **Confirm list with user before proceeding.**

### Phase 3: Capture

See "Capture Commands" section below.

### Phase 4: Present

Summary table, open all screenshots in Preview, ask: **"Approve, request changes, or more screenshots?"**

### Phase 5: Cleanup

Remove anvil worktree via the anvil agent. Screenshots persist in `/tmp/cli-visual-review/<id>/` (cleaned on reboot).

## Mode 2: Ad-hoc

**Trigger:** `/visual-review-cli "scribe list"` or "screenshot scribe list"

1. Use current directory (no worktree)
2. Build if needed, or use existing binary
3. Capture the specified command(s)
4. Present results

## Capture Commands

**Storage:** `/tmp/cli-visual-review/<id>/` where `<id>` is PR number or `adhoc-<timestamp>`.

### Static (termshot)

```bash
termshot --show-cmd -f /tmp/cli-visual-review/<id>/<name>.png -- <binary> <args>
```

Immediately after:
```bash
open -a Preview /tmp/cli-visual-review/<id>/<name>.png
```
Then use Read tool on the PNG to show inline.

### TUI/Interactive (vhs)

Generate a `.tape` file:

```tape
Output /tmp/cli-visual-review/<id>/<name>.gif
Set Shell bash
Set FontSize 14
Set Width 1200
Set Height 600
Type "<binary> <args>"
Enter
Sleep 2s
Screenshot /tmp/cli-visual-review/<id>/<name>.png
```

Run: `vhs /tmp/cli-visual-review/<id>/<name>.tape`

Produces GIF (full recording) + PNG (final frame). Open and show inline same as static.

### TUI Detection

Auto-detect by checking for Bubble Tea imports (`tea.Model`, `tea.Program`) in changed files. Use VHS for TUI commands, termshot for everything else.

## Quick Reference

| Output type | Tool | Format | Flag |
|------------|------|--------|------|
| Static CLI | termshot | PNG | `--show-cmd` renders command above output |
| Interactive TUI | vhs | GIF + PNG | `.tape` script controls timing |

## Rules

1. **Never change the user's local checkout branch.** PR work in anvil worktree only.
2. **Show screenshots inline** via Read tool + open in Preview immediately after each capture.
3. **Always clean up** anvil worktree when done (unless user wants to keep it).
4. **Confirm command list** before running in PR mode.
5. **Auto-detect TUI vs static** — VHS for Bubble Tea, termshot for everything else.
6. **Multi-language build detection** — don't hardcode Go.
7. **Auto-install tools** — prompt once, then brew install.

## Present Results

| Command | Type | Status | Screenshot |
|---------|------|--------|------------|
| `scribe list` | static | OK | list.png |
| `scribe sync` | TUI | OK | sync.png + sync.gif |

Open all at once: `open -a Preview /tmp/cli-visual-review/<id>/*.png`

Ask: **"Approve, request changes, or need more screenshots?"**

After presenting results, add a review nudge:

> Visual QA covers how it looks, not how it works. If you haven't already, consider running a code review (`/review`, `/code-review`, or manual diff review) before approving this PR.
