# Periodic hygiene

## Worktree cleanup — mechanical, orchestrator-side

Stale anvil worktrees accumulate fast (deps + Herd links + certs + DBs per branch). 10+ stale worktrees can consume GB and drag system perf. Mechanical work — do it yourself, don't dispatch.

Rule:
1. **After every PR merge:** remove that branch's worktree (`anvil remove <branch> --force`).
2. **Before every wave-boundary status:** list worktrees + remove any whose branch is merged or whose worker is closed.
3. **After a release cut:** force-remove ALL except `main` and the orchestrator's worktree.
4. **At session start (orient phase):** list worktrees. If >5 stale, purge before dispatching new work.

```bash
anvil list                       # or `git worktree list`
for branch in <merged-list>; do
  anvil remove "$branch" --force # or `git worktree remove <path> --force`
done
df -h /                          # log delta if you care
```

Save freed-space to MemPalace as calibration data (AAAK e.g. `worktrees.purged.11+disk.freed.45gb`).

## Slash-command hygiene delegates

Both run as Claude solo delegates (slash-command-driven, no worktree needed):

- **`/cleanup`** — scans for stale plans/specs/orphan files. Dispatch after any wave that closed 3+ todos.
- **`/document-release`** — updates README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md + opens `docs/release-<version>` PR. Dispatch after any merge that changed public API/CLI surface/user-visible behaviour.

Bad times: after every commit (noise); mid-active feature (conflicts).

```text
# /cleanup brief
Run /cleanup on <repo>. Focus: completed plans under docs/plans/, stale
docs/roadmap/ for shipped versions, outdated README sections (vs VERSION),
orphaned fixtures/design files. Don't delete load-bearing items without
flagging. Summary → scratchpad `cleanup-YYYY-MM-DD`.
```

```text
# /document-release brief
Run /document-release on <repo>. Compare current main (or feature branch)
against last tagged release. Update README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md
to match reality. Open PR on `docs/release-<version>` targeting main (or the
feature branch if pre-release). No source changes. No spec edits for
intentionally-deferred work.
```
