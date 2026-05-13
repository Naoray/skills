# Workflow — Refresh an existing north star

Use when `docs/NORTH_STAR.md` exists (or a MemPalace drawer exists) and the user wants to update it — typically because a new constraint emerged, a non-goal was lifted, or a decision principle changed.

## Pre-flight

1. **Read both surfaces.**
   - `ctx_read docs/NORTH_STAR.md mode=full`
   - `mempalace_get_drawer wing=<project> name=north-star` (or equivalent search → fetch)
2. **Drift check.** Compare. If the two diverge in mission / non-goals / constraints / principles:
   - Print the diff inline.
   - Ask: "Two sources disagree. Which is canonical — file or drawer?"
   - Whichever the user picks becomes the input draft; the other will be overwritten on persist.
3. **Capture the trigger.** What prompted this refresh? One line. (Used in the diary entry on persist.)

## Delta — propose changed sections only

Do NOT rewrite the whole document. Identify which of the six sections actually need to change. For each:

1. Quote the current text verbatim.
2. Propose the new text.
3. State the trigger (incident, user directive, shipped feature, removed scope).

Print the proposal as:

```
SECTION: <name>
CURRENT:
  <verbatim>
PROPOSED:
  <new>
WHY:
  <one-line trigger>
```

## User signoff — per section

Ask:

> Per-section: reply `approve` to accept, `edit: <new text>` to override, `keep` to leave unchanged, or `approve all` to accept every proposal.

Iterate until every section the agent flagged is resolved.

**Do NOT persist before every flagged section has an explicit resolution** (`approve`, `edit:`, or `keep`). A partial "looks good" is not signoff — bundle approval is the failure mode this gate exists to prevent.

Why per-section: a refresh is rarely all-or-nothing. The user may approve a new non-goal while wanting to rewrite a principle in their own words. Bundle approval hides that fork.

## Persist

1. **Write `docs/NORTH_STAR.md`** with the merged content. Preserve untouched sections verbatim — do not auto-rewrite for style.
2. **Update MemPalace drawer.** `mempalace_update_drawer` with the new content + refreshed `Source: <repo>/docs/NORTH_STAR.md @ <new SHA>` header.
3. **Diary entry** persona `architect`: `North star refreshed for <project>: <changed sections>. Trigger: <one-line>.` Why: future `mempalace_search query="why did the north star change"` works.
4. **Stage + commit** if the user is in a commit flow. Message: `docs: refresh north star (<section>: <one-line>)`.

## Anti-patterns

- **Wholesale rewrite.** If you're touching all six sections, you're not refreshing — you're re-deriving. Stop. Route to [derive.md](derive.md) after archiving the old file.
- **Skipping the diff check.** Two surfaces drift quietly when only one is updated. The drift prompt is the seam that catches that.
- **Persisting silently after a single "looks good".** Per-section signoff exists for a reason — the user might accept 4 of 5 changes; bundling hides the 5th.
- **Updating the drawer without the file.** Drawer is mirror, file is canonical. Out-of-band drawer edits get reverted on next consult.

## Verify

- `docs/NORTH_STAR.md` mtime is newer than before.
- Drawer's `Source:` SHA matches the new HEAD.
- `git diff HEAD~1 docs/NORTH_STAR.md` shows only the proposed sections changed.
- Next `consult.md` reports no drift.
