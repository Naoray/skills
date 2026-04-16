---
name: flow-review
description: >
  Generate ASCII flow diagrams of changed code so the user can understand what
  the logic actually does before reviewing or approving. Invoke this skill
  whenever an implementation step completes — feature added, logic changed, bug
  fixed, refactor done — especially before the user is asked to approve or merge
  anything. Also trigger on: "show me the flow", "what did you change", "walk me
  through what you built", "I want to understand this before approving", "explain
  the logic", "what does this do". The goal is to replace blind approval with
  genuine understanding of underlying principles.
---

# Flow Review

You are generating ASCII flow diagrams so the user can understand what the
changed code actually does — not just what lines were added, but how the logic
flows at runtime.

The user's goal is to stop blindly approving changes and start understanding
the principles behind each one. Every diagram you generate should answer:
"If I run this, what actually happens, step by step?"

---

## Step 1 — Identify what changed

```bash
git diff --stat HEAD~1 2>/dev/null || git diff --stat origin/main 2>/dev/null || git diff --stat
```

If the diff is against a PR or specific commit, use whatever base makes sense
from context. If the user specifies a file or function, scope to that.

Look at the stat output and identify which files contain **logic changes** —
not just formatting, comments, or config. Focus on:

- New functions or methods
- Modified control flow (new if/else branches, switch cases, loops)
- New delegation (function A now calls B, or B is no longer called)
- Changed error handling paths
- New public API surface

Skip files that only have: import reordering, variable renames, comment changes,
whitespace, or test helpers with no conditional logic.

---

## Step 2 — Read the changed functions in full

For each function or method with logic changes:

1. Read the **entire function** from the current state of the file (not just the
   diff lines). You need the full picture to draw an accurate flow.
2. Also read any functions it delegates to that are new or changed.
3. Note which parts existed before (unchanged) vs what is new.

Use `git show HEAD~1:path/to/file` or `git diff -U999` to see the old version
when you need before/after comparison.

---

## Step 3 — Generate flow diagrams via /ascii

One diagram per logical unit of change. A "logical unit" is a function, a
workflow, or a complete user-facing path (e.g., "what happens when the user
picks Join").

**Delegate each diagram to the `/ascii` skill** using the `Skill` tool:

```
Skill("ascii", args: "<description of the flow to diagram>")
```

Compose the description to include:

1. **The entry point** — what function or path this diagram covers
2. **The runtime steps** — what happens in order, including branches and loops
3. **What is new vs existing** — annotate with `[NEW]`, `[MOD]`, or
   `unchanged` so the diagram distinguishes the delta
4. **Delegation targets** — name the functions/commands called and whether
   they changed
5. **Error paths** — at minimum where errors return vs where execution continues

Example description to pass to `/ascii`:

> "runGuideInteractive dispatch — three branches: join (unchanged: resolveRepo
> then workflow.Run ConnectSteps), create [MOD: now calls
> createRegistryCmd.SetContext(cmd.Context()) before runCreateRegistry — was
> missing before causing nil context panic], view [MOD: now calls
> listCmd.SetContext(cmd.Context()) before runList — same fix]. Show the
> SetContext call as a new step in create and view paths."

After the `/ascii` skill generates the diagram, do **not** save it to a file
(choose "Don't save" or skip the save prompt). The diagram is for display only.

If there are multiple changed flows, invoke `/ascii` once per flow — each gets
its own diagram. Run them sequentially so each diagram renders cleanly before
the next.

---

## Step 4 — Write the "what changed" header

Before the diagrams, write a short plain-English summary:

```
FLOW REVIEW — <branch or commit range>
════════════════════════════════════════
Changed flows: N
Files touched: file1.go, file2.go

What changed at the logic level:
  • [NEW] runGuideInteractive — join/create/view dispatch table
  • [MOD] displayPrereqs — plural handling for registry count
  • [NEW] SetContext propagation before cross-command delegation
```

This anchors the diagrams. The user reads this first to know what they're
about to see.

---

## Step 5 — Present for decision

After the diagrams, explicitly invite the user to respond:

- "Does this match your mental model, or does something look wrong?"
- "Is there a path here you want me to trace deeper?"
- "Anything you'd like to change about how this flows?"

This is not a rhetorical close. The user is here to understand and potentially
redirect — make it easy for them to do that.

---

## What NOT to do

- Don't diagram every line of code. Diagram the flow — the runtime path.
- Don't skip error paths just because they're boring. They matter.
- Don't make diagrams so wide they wrap. Keep boxes narrow, use vertical flow.
- Don't summarise what the diff says. Show what the code *does*.
- Don't ask "should I generate a diagram?" — just do it. That's why this
  skill exists.

---

## Example output shape

The header is written inline. Each diagram is produced by invoking `/ascii`:

```
FLOW REVIEW — feat/restore-guide-command
════════════════════════════════════════
Changed flows: 2
Files touched: cmd/guide.go

What changed at the logic level:
  • [MOD] displayPrereqs — registry count pluralisation
  • [MOD] runGuideInteractive — SetContext propagation in create + view paths
```

Then, for each flow, invoke `/ascii` with a description like:

> "displayPrereqs registry count: reads len(result.Connections.Repos).
> Before [MOD]: always printed 'Connected to N registry' (singular).
> After: branches on n — if n=1 prints 'registry', if n>1 prints 'registries'
> [NEW branch]. Show the decision point and both output labels."

> "runGuideInteractive chosen='create' path [MOD]: now calls
> createRegistryCmd.SetContext(cmd.Context()) [NEW step] before
> runCreateRegistry(). Previously ctx was nil causing panic in
> context.WithTimeout. Same fix for chosen='view': listCmd.SetContext(ctx)
> [NEW step] before runList(). Show both paths with the new SetContext step
> highlighted."

The `/ascii` skill renders the actual box-and-arrow diagram from those
descriptions. After each diagram, add a one-line callout of the key principle:

```
↑ SetContext propagation: any cross-command delegation must carry the
  parent command's context, or downstream API calls receive nil and panic.
```
