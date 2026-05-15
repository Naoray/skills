# Post-dispatch review + merge

**Scope: code PRs only.** Pure docs / skill / prose updates with no behavioural impact merge directly after a quick sanity read — don't burn a reviewer agent on markdown.

For code PRs, dispatch a fresh reviewer per PR with a combined brief covering code-quality AND plan-conformance. The reviewer gates the merge.

```
1. DISPATCH REVIEWER  Pick per routing table. Reviewer does:
                      a) /review (or codex review) for quality
                      b) Plan-conformance (diff PR scope vs originating todo/spec)
                      Verdict:
                        CLEAN    → merges (rebase for feature-target, squash for main)
                                   deletes remote branch, closes worktree
                        NITS     → merges + files follow-up todos
                        BLOCKERS → does NOT merge; files solo todos + PR review comment
2. EVALUATE FEEDBACK  Orchestrator reads reviewer summary. For BLOCKERS:
                      dispatch fix agent on new anvil worktree → cycle to step 1.
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
| Plan formalization multi-review | **Dual: Claude + Codex** + Gemini optional adversarial 3rd; skip Cursor (0/2 reliability) | Codex catches impl pragmatics; Claude catches contract drift. Neither substitutable. |

You don't need dual reviews on everything — utilize Codex by default, dual for high-stakes.

## Reviewer brief template

```text
You are reviewing and potentially merging PR <URL>.

## Context
- Origin: solo todo #<ID> — <title>. Body at `solo todos get <ID> --project-id <p>` (CLI).
- Spec section(s): <file:line refs>
- Counselors / prior review artefacts: <scratchpad slug / file path>

## Your job
1. Run `/review <PR>` (or codex review) for quality, security, convention.
2. Plan-conformance: re-read todo + spec, diff PR vs scope, flag missing/extra.
3. Sanity tests: fetch branch, run project test command, confirm green.
4. Decide: CLEAN / NITS / BLOCKERS.

## On CLEAN or NITS
- Merge (rebase-merge for feature-branch targets, squash for main).
- For NITS: open follow-up solo todo per nit with scope + rationale.
- Delete remote branch.
- Print merge SHA + "MERGED".

## On BLOCKERS
- Do NOT merge.
- Post one PR review comment summarising every blocker (file:line + required fix).
- File a solo todo per blocker.
- Print "BLOCKED — <count> todos filed".

## Rules
- Use scribe / gh / `solo` CLI as needed. `solo` calls go through ctx_shell
  so list/get outputs compress.
- Write structured verdict to scratchpad `pr-<NUMBER>-review`
  (`solo scratchpads create --project-id <p> --name pr-<N>-review --content <body>`)
  before mutating PR state.
- Do not push or comment anything else.
```
