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

## Scratchpad + todo hygiene — mechanical, orchestrator-side

State surfaces accumulate across waves (`done/*` scratchpads, finished tracking todos, stale-and-vague todos) and start lying about what's live. Prune so the surfaces reflect ONLY live work. Mechanical — orchestrator does it directly, does not dispatch.

Run **after harvesting a delegate (once its artifact is verified)** and **at every wave boundary**:

1. **Archive harvested artifacts.** After a delegate's `done/*` scratchpad is read and its artifact (PR/commit/verdict) verified, `scratchpad_archive` it.
2. **Close finished tracking.** Complete/close todos whose work has merged or whose verdict is filed.
3. **Re-evaluate open todos.** Walk the open list:
   - drop obsolete ones (superseded, abandoned, duplicated),
   - re-prioritize the rest against the current north star / next wave,
   - split anything stale-and-vague into concrete actionable items.

Goal: a glance at scratchpads + todos shows live work only — no harvested ghosts, no dead todos.

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
