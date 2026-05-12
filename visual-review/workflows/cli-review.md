# CLI Review

Read `principles/visual-qa.md`.

## Tool Check

For static terminal output, prefer `termshot` when installed.
For interactive TUIs, prefer `vhs` when installed.

If required tools are missing, ask once before installing.

## Steps

1. Identify command list.
2. Detect output type:
   - static command output: screenshot
   - interactive TUI: recording plus final-frame screenshot
3. For PR review, build the project in an isolated worktree when needed.
4. Capture artifacts under `/tmp/cli-visual-review/<id>/`.
5. Open artifacts for inspection and report paths.

## Static Capture

```bash
termshot --show-cmd -f /tmp/cli-visual-review/<id>/<name>.png -- <binary> <args>
```

## TUI Capture

Create a `.tape` file and run `vhs`:

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

## Output

```text
VISUAL REVIEW — CLI

Inspected:
- Command/type: artifact path

Findings:
- High: broken rendering, clipped content, unreadable output
- Medium: confusing hierarchy, bad wrapping, missing empty/error state
- Low: polish issue

Not inspected:
- ...
```
