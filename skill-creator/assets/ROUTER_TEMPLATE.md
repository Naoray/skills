---
name: TODO-kebab-case-name
description: TODO write the 5-part trigger contract as a single paragraph. Use when [concrete trigger phrases]. Inputs needed - [2-4 required pieces]. Do not use when [disqualifier 1], [disqualifier 2] - [recommended alternative form]. Produces [concrete artifact]. Escalate if [condition 1] or [condition 2].
---

# TODO Skill Title

TODO one-paragraph purpose. Evidence tier: **TODO E/P/H** with provenance:

- **Basis**: TODO the standard, framework, or expert workflow this is grounded in
- **Source IDs**: TODO concrete identifiers (repos, papers, internal docs)
- **Reviewed**: TODO YYYY-MM-DD

## TODO Fit gate (inline)

TODO the fit-gate questions specific to this skill, or "see skill-creator/SKILL.md Fit gate" if generic.

## Route

Read this file. Then read exactly one of:

- `workflows/<mode-1>.md` — TODO one-line description of mode 1
- `workflows/<mode-2>.md` — TODO one-line description of mode 2
- `workflows/<mode-3>.md` — TODO one-line description of mode 3

TODO if 2 modes only: consider inline branching instead of router (see `skill-creator/references/multi-mode-skills.md` for thresholds).

## Cross-cutting rules

TODO list rules that span all workflows (naming conventions, output format invariants, safety boundaries, etc.). Keep brief.

## Anti-patterns

- TODO what NOT to do (with one-line WHY each).
- TODO duplicate the universal anti-patterns from skill-creator/SKILL.md only if this skill needs to emphasize them; otherwise reference.

## See also

- `workflows/<mode-1>.md`, `workflows/<mode-2>.md`, etc.
- `references/<topic>.md` (one bullet per reference file, with when-to-read)
- `evals/trigger.csv` (10-20 prompts, with near-miss negatives)
- `evals/checks.md` (must-pass deterministic checks; OR "inherits skill-creator/evals/checks.md")

---

## Author checklist (delete before committing)

- [ ] Replaced every TODO above
- [ ] Frontmatter `name` matches folder name exactly
- [ ] Description has all 5 trigger parts (use `references/trigger-contract.md` checklist)
- [ ] SKILL.md ≤120 lines (router-style limit)
- [ ] No sibling `README.md`, `INSTALLATION.md`, `CHANGELOG.md`, `QUICK_REFERENCE.md` inside this folder
- [ ] No MUST/ALWAYS/NEVER without an accompanying WHY clause
- [ ] Evidence tier + provenance declared in body's first paragraph
- [ ] At least one workflow file exists under `workflows/`
- [ ] At least one mode is selectable from the `## Route` section without ambiguity
- [ ] `evals/trigger.csv` exists with ≥10 prompts including near-miss negatives, OR a written reason for skipping
- [ ] `evals/checks.md` exists OR inherits the canonical list from `skill-creator/evals/checks.md`
- [ ] Registry-integration step completed for the active backend (see `references/registry-integration.md`)
- [ ] Manual trigger check: 2 should-trigger + 1 near-miss prompts confirmed
- [ ] Reviewer pass: a second agent or human audited; high-priority findings addressed
