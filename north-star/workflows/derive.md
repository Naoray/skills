# Workflow — Derive a new north star

Use when `docs/NORTH_STAR.md` does not exist (and the MemPalace drawer `north-star` in `wing=<project>` is empty). Inspection → draft → user signoff → persist both surfaces.

## Pre-flight

1. **Confirm absence.** `ls docs/NORTH_STAR.md` and `mempalace_search wing=<project> query="north star"`. If either exists, stop and route to [refresh.md](refresh.md).
2. **Confirm path convention.** Some projects use `STRATEGY.md` at repo root, `.github/NORTH_STAR.md`, or `docs/specs/NORTH_STAR.md`. Ask the user once if `docs/NORTH_STAR.md` is wrong for this repo. Default to `docs/NORTH_STAR.md` only after no objection.
3. **Project slug for MemPalace.** Resolve `<project>` = repo name (kebab-case) unless the user has already established a different wing name via `mempalace_list_wings`.

## Inspection — read-only signal pass

Run these in parallel. Synthesise, do not dump raw output.

| Signal | Tool | What it reveals |
|--------|------|-----------------|
| README | `ctx_read README.md mode=full` | Mission framing, target users, install paths. |
| Package manifest | `cat package.json` / `Cargo.toml` / `composer.json` / `pyproject.toml` | Stack constraints, named owner, license, dependency surface (tech constraints). |
| CHANGELOG | `ctx_read CHANGELOG.md mode=signatures` | What this project has actually shipped (vs. aspirational README). |
| Recent commits | `git log --since="6 months ago" --no-merges --pretty="%s"` | Real direction trend. Ignore noise; cluster themes. |
| Open issues | `gh issue list --state=open --limit=30` | What users are asking for; what is broken; common pain. |
| Existing drawers | `mempalace_search wing=<project> query="decision OR direction OR mission"` | Locked decisions, prior incident lessons, verbatim user directives. |
| Adjacent docs | `ctx_tree docs/ depth=2` | Existing specs, ADRs, charters — to avoid duplication. |

If the repo has fewer than 5 commits or no README, signal is too thin. Ask the user to describe the project in 3-5 sentences before drafting.

## Draft — fill the template

Open [../references/template.md](../references/template.md). Fill each of the six sections:

1. **Mission** — one sentence, verb-led. Test: read it aloud. If you say "yes obviously" the mission is too weak (no decisions excluded). If you say "wait, really?" it's strong.
2. **Target users / adopters** — name a concrete persona, role, or named adopter. "Developers" is too broad; "Laravel teams shipping AI agents inside Filament admin panels" is right-sized.
3. **Non-goals** — at least 3. Each should be something a reasonable reader might assume IS a goal. If a non-goal feels obvious, it's not pulling weight — replace it.
4. **Hard constraints** — tech (must run on X), legal (cannot store PII), budget (≤$N/mo infra), compatibility (Node ≥20). Each must be falsifiable.
5. **Decision principles** — 3-7, priority-ordered. Format: `<rule>. Why: <one-line reason>. Beats: <what it overrides>.` Example: `Defer features over breaking existing adopters. Why: trust costs more to rebuild than features cost to ship later. Beats: shipping velocity.`
6. **Success + anti-signals** — 2-4 of each. Concrete enough that an agent could check them in 6 months.

## User signoff — REQUIRED

Print the full draft inline. Then ask exactly:

> Approve as-is, edit specific sections, or restart? Reply `approved`, `edit: <section>`, or `restart`.

Iterate on `edit:` answers until `approved`. Do NOT persist before that token.

Why: this artefact becomes load-bearing for every downstream agent decision. An un-reviewed draft poisons the well — every brief afterwards cites a hallucinated mission. The signoff token is the only durable consent surface.

## Persist — both surfaces, repo first

1. **Write `docs/NORTH_STAR.md`** (or the path confirmed in pre-flight). Use `Write`. The file's `mtime` is the canonical timestamp.
2. **Mirror to MemPalace.** Add a drawer to `wing=<project>`:
   - Name: `north-star`
   - Content: copy the file contents verbatim, plus a header line `Source: <repo>/docs/NORTH_STAR.md @ <git rev-parse HEAD>` so future drift checks know the source-of-truth commit.
   - Tool: `mempalace_add_drawer` or `mempalace_kg_add` per the team's MemPalace conventions.
3. **Diary entry** with persona `architect`: one-line "North star derived for <project>: <mission>". This makes the act of derivation queryable later.
4. **Stage + commit** (only if user is in a clean-commit flow):
   ```
   git add docs/NORTH_STAR.md
   git commit -m "docs: add project north star"
   ```
   If the user has agent-commit discipline (`[agent]` prefix), use their convention. Do NOT push without ask.

## Verify

- `ls -la docs/NORTH_STAR.md` returns the file.
- `mempalace_search wing=<project> query="north-star"` returns the new drawer.
- The drawer's content includes the `Source:` header with a git SHA matching `git rev-parse HEAD` at write time.
- File has all six required sections (grep for headers).
- Re-running `consult.md` immediately after returns a no-drift status.

## Handoff

After persist, the next orchestrator-mode invocation will auto-load this artefact. No further action required. If the user wants to dispatch agents in the current session, they can now `/orchestrator-mode` and skip the "act autonomously per the north star" preamble — it loads itself.
