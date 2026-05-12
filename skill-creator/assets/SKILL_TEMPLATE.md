---
name: TODO-kebab-case-name
description: TODO write the 5-part trigger contract here as a single paragraph. Use when [concrete trigger phrases the user would say, including the artifact and phase]. Inputs needed - [2-4 required pieces of context]. Do not use when [disqualifier 1], [disqualifier 2] - [recommended alternative form like snippet or inline prompt]. Produces [concrete artifact with format constraints]. Escalate if [condition 1] or [condition 2].
---

# TODO Skill Title

TODO one-sentence purpose statement. Evidence tier: **TODO E/P/H** — [one line on why this tier].

## TODO Required inputs (or rename: Inputs / Setup)

TODO list the concrete inputs the skill assumes are in hand. Match what's in the description's "Inputs needed" clause.

## TODO Workflow (or rename: Authoring loop / Steps)

1. TODO first step (imperative, concrete)
2. TODO second step
3. TODO third step
...

For each step, explain WHY in one sentence if non-obvious. Caveman-lite voice: drop articles, drop filler, fragments OK.

## TODO Output

TODO describe the artifact in concrete terms — file path, format, content shape. Match the description's "Produces" clause.

## TODO Verification

TODO list 2-4 mechanical checks that prove the work is done. The user (or future-agent) runs these before declaring success.

## TODO Anti-patterns

- TODO what NOT to do, with one-line WHY each.

## TODO See also (only if bundled resources exist)

- `references/<topic>.md` — TODO when to read this file
- `assets/<template>.md` — TODO when to use this asset
- `scripts/<helper>.sh` — TODO what it automates

---

## Author checklist (delete before committing)

- [ ] Replaced every TODO above
- [ ] Frontmatter `name` matches folder name exactly
- [ ] Description has all 5 trigger parts present (use the `references/trigger-contract.md` checklist)
- [ ] Body under 200 lines (hard ceiling 500)
- [ ] No `README.md`, `INSTALLATION.md`, `CHANGELOG.md`, `QUICK_REFERENCE.md` inside this folder
- [ ] No MUST/ALWAYS/NEVER without an accompanying WHY clause
- [ ] Bundled resources justified by ≥3 expected reuses (scripts) or ≥4 worked examples (references)
- [ ] Evidence tier (E / P / H) declared in body's first paragraph
- [ ] Registry-integration step completed for the active backend (auto-discovery confirmed, OR catalog entry added to `scribe.yaml`, OR `php artisan boost:update` run, OR equivalent for your tool — see `references/registry-integration.md`)
- [ ] Folder/name match (and catalog entry where applicable)
- [ ] Manual trigger check: 2 should-trigger + 1 near-miss prompts confirmed
- [ ] Reviewer pass: a second agent or human audited the skill against the skill-creator contract; high-priority findings addressed
