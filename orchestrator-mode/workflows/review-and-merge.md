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

## Visual-review gate (UI-changing PRs)

**Trigger:** the PR changes UI / visual output — templates, CSS, layout, fonts, rendered HTML, anything a user sees rendered. Code review (Codex/Claude code-gate) verifies contrast math, structure, and convention but **structurally cannot catch a rendered-output regression** (e.g. a mobile `<=390w` hero-title clip that passes every contrast check). Add this gate **after the code-review gate returns CLEAN and before merge.**

```
1. CODE GATE     Reviewer returns CLEAN (quality + plan-conformance) — as above.
2. VISUAL GATE   Dispatch a Claude visual-QA delegate. It:
                 a) renders the app / preview locally,
                 b) captures screenshots via Playwright MCP
                    (fall back to a cached/bundled browser if system Chrome absent),
                 c) compares against brand / design intent at BOTH desktop
                    AND mobile widths (e.g. 1280w + 390w),
                 d) returns PASS or ISSUES.
                 ISSUES: each issue + screenshot ref, filed as tracking todos.
3. ROUTE         Merge ONLY when code-clean AND visual PASS.
                 ISSUES → dispatch a Claude fix delegate on the SAME branch,
                          then re-run the visual gate. Cycle until PASS.
```

Sentinel (add to the visual-QA delegate's reporting contract):

| Role | Terminal sentinel |
|---|---|
| visual reviewer | `REVIEW DONE: <PASS\|ISSUES>` |

Non-visual code PRs skip this gate. Docs-only PRs skip both gates.

### Visual-QA delegate brief template

```text
<paste Reporting contract preamble from your transport guideline>

You are the VISUAL-QA reviewer for PR <URL> (branch <BRANCH>).
Do NOT merge — you only return a visual verdict.

## Your job
1. Fetch the branch + set up an isolated workspace.
2. Render the app / preview locally (start dev server or build static preview).
3. Capture screenshots with the Playwright MCP at BOTH desktop (e.g. 1280w)
   AND mobile (e.g. 390w) widths. If system Chrome is absent, fall back to a
   cached/bundled browser.
4. Compare against brand / design intent (reference the live brand site or
   design spec). Look for clipping, overflow, misalignment, font/scale breaks,
   contrast-in-context, responsive regressions.
5. Decide: PASS or ISSUES.

## On PASS
- Write verdict to a durable scratchpad (e.g. `pr-<NUMBER>-visual`).
- Print `REVIEW DONE: PASS`.

## On ISSUES
- For each issue: file a tracking todo with description + screenshot ref + viewport.
- Write the full verdict (with screenshot refs) to the scratchpad.
- Print `REVIEW DONE: ISSUES` + count.

## Rules
- Do not merge, push, or comment on the PR. Verdict only.
- Screenshots/refs live in durable state, never the repo.
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
