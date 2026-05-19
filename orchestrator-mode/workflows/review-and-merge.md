# Post-dispatch review + merge

**Scope: code PRs only.** Pure docs / skill / prose updates with no behavioural impact merge directly after a quick sanity read — don't burn a reviewer agent on markdown.

For code PRs, dispatch a fresh reviewer per PR with a combined brief covering code-quality AND plan-conformance. The reviewer gates the merge.

```
1. DISPATCH REVIEWER  Pick per routing table. Reviewer does:
                      a) /review (or codex review) for quality
                      b) Plan-conformance (diff PR scope vs originating todo/spec)
                      Verdict:
                        CLEAN    → merges (rebase for feature-target, squash for main)
                                                           deletes remote branch, closes workspace
                                                NITS     → merges + files follow-up tracking items
                                                BLOCKERS → does NOT merge; files tracking items + PR review comment
                        2. EVALUATE FEEDBACK  Orchestrator reads reviewer summary. For BLOCKERS:
                                              dispatch fix agent on new isolated workspace → cycle to step 1.

3. POST-MERGE         git checkout main; git pull --ff-only; git fetch --prune;
                      list remaining todos; decide next wave;
                      cleanup the merged branch's worktree.
```

## Reviewer routing

| Task | Default reviewer | Rationale |
|---|---|---|
| Code PR merge-gate (small-medium scope) | **Codex** | Catches Cargo cycles, type-system gotchas, regex edges, fail-closed regressions. |
| Spec-heavy code PR (multi-doc reading, skill invocation, architectural synthesis) | **Claude** | Spec-reading depth + `/review`/`/qa`/`/audit` skill stack. |
| Docs-only PR (prose `*.md`) | **None — orchestrator merges** | Don't burn a code-review voice on prose. |
| High-stakes code PR (release-blocking, security-adjacent, multi-module refactor) | **Dual: Claude + Codex parallel** | Orthogonal blocker classes. Orchestrator synthesizes before merge. |
| Plan formalization multi-review | **Dual: Claude + Codex** + Gemini adversarial 3rd | Codex catches impl pragmatics; Claude catches contract drift; Gemini finds dissenting edge cases. |

You don't need dual reviews on everything — utilize Codex by default, dual for high-stakes.

## Reviewer brief template

```text
You are reviewing and potentially merging PR <URL>.

## Context
- Origin: Tracking item (e.g. solo todo) #<ID> — <title>.
- Spec section(s): <file:line refs>
- Counselors / prior review artefacts: <scratchpad slug / file path>

## Your job
1. Run `/review <PR>` (or codex review) for quality, security, convention.
2. Plan-conformance: re-read tracking item + spec, diff PR vs scope, flag missing/extra.
3. Sanity tests: fetch branch, run project test command, confirm green.
4. Decide: CLEAN / NITS / BLOCKERS.

## On CLEAN or NITS
- Merge (rebase-merge for feature-branch targets, squash for main).
- For NITS: open follow-up tracking item per nit with scope + rationale.
- Delete remote branch.
- Print merge SHA + "MERGED".

## On BLOCKERS
- Do NOT merge.
- Post one PR review comment summarising every blocker (file:line + required fix).
- File a tracking item per blocker.
- Print "BLOCKED — <count> items filed".

## Rules
- Use scribe / gh / transport CLI as needed.
- Write structured verdict to a durable scratchpad (e.g. `pr-<NUMBER>-review`) via your transport before mutating PR state.
- Do not push or comment anything else.
```
