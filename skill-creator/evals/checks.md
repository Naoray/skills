# Skill Checks — must-pass deterministic verification

Run these against any skill produced or revised by skill-creator. They are mechanical — an LLM can apply them; a small shell script could too. None require subjective judgment.

A skill must pass ALL of these before it ships. A reviewer pass (see `workflows/package.md` step 4) catches the subjective issues that these mechanical checks miss.

## Structural checks

C1. **Folder name === frontmatter `name`.** `cat <skill>/SKILL.md` frontmatter `name:` field must equal the directory basename.

C2. **Frontmatter has both `name` and `description`.** No other required fields. No `compatibility:`, no metadata blocks unless the host actually consumes them.

C3. **No sibling docs inside the skill folder.** None of these may exist at the skill root: `README.md`, `INSTALLATION.md`, `INSTALL.md`, `CHANGELOG.md`, `QUICK_REFERENCE.md`. Nested `README.md` files inside `references/<subdir>/` ARE allowed when they are part of the retrieval surface (see `references/multi-mode-skills.md`).

C4. **Body length ≤500 lines hard ceiling.** Target ≤200 lines for non-router skills; router-style `SKILL.md` should be ≤120 lines. Use `wc -l <skill>/SKILL.md` to measure.

## Description contract checks

C5. **All 5 trigger parts present in `description`.** Re-read the description and identify each part:
   - Use when — concrete trigger phrases
   - Inputs — required context
   - Do not use when — hard disqualifier + alternative form
   - Produces — concrete artifact
   - Escalate if — stop-and-ask conditions

   Missing any part = fail.

C6. **Description ≤140 words.** Long descriptions tax every invocation. `awk '/^description:/,/^---$/' SKILL.md | wc -w` (subtract the trailing `---` and `description:` literal).

C7. **No "pushy" trigger language** in the description ("make sure to use", "always", "be sure to", "whenever"). Use high-recall trigger phrases + a hard disqualifier instead.

## Body content checks

C8. **Evidence tier + provenance declared in body's first paragraph.** Tier must be one of `E`, `P`, or `H`. Provenance line is required and must list `Basis` (the standard, framework, or expert workflow the skill is grounded in), `Source IDs` (concrete identifiers — repos, papers, internal docs), and `Reviewed` (date the tier was last audited). Why: without provenance the tier is decorative; with it, future-revisers can tell stale citations from current ones and judge whether tier upgrades or downgrades are warranted.

C9. **No MUST / ALWAYS / NEVER without an accompanying WHY clause.** Each occurrence of these all-caps imperatives must have a clause explaining the reason (in the same sentence or the next one).

C10. **No environment-specific paths or commands in the body** that are not framed as "one of several backends". Tool-specific recipes belong in `references/registry-integration.md` (or `references/portability.md`).

## Registry integration checks

C11. **Catalog entry present** for the active backend (if the backend uses a catalog file like `scribe.yaml`). Folder count and catalog entry count should match (or the difference is intentionally documented).

C12. **Sync command run** after catalog change, OR an explicit note in the commit message stating why it was skipped (draft-only iteration is the only acceptable reason).

## Eval contract checks (optional but recommended)

C13. **`evals/trigger.csv` exists** OR the skill has a written reason for skipping evals (one-off draft only). The CSV should have ≥1 should-trigger row AND ≥1 should-not-trigger row.

C14. **`evals/checks.md` exists** OR the skill explicitly inherits this file via documentation.

## Reviewer pass check

C15. **Reviewer pass completed** before declaring done. A second agent or human auditor signed off after the author finished. This catches stale examples, hardwired assumptions, and contract violations that the author missed. See `workflows/package.md` step 4.

## How to use this file

When auditing a skill: walk through C1–C15 in order. Stop at the first fail and report it with a concrete fix. When all pass: report `CHECKS PASS (15/15)`.

When refining this file: keep checks deterministic and concrete. Subjective checks ("is the description well-written?") belong in the reviewer pass, not here.
