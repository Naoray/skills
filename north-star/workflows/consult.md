# Workflow — Consult the north star

Read this when wiring downstream consumers (orchestrator-mode boot, delegate brief injection). This workflow defines the read + drift-check contract that other skills depend on.

## Public contract — what consumers call

Two operations:

| Operation | Returns | Used by |
|-----------|---------|---------|
| `load(<project>)` | Full north-star content as a markdown block + `state: { source, path, sha, drift }` | `/orchestrator-mode` boot; ad-hoc user "show me the north star". |
| `inject(<brief>)` | The brief with a `## Project north star` section prepended (or noted "no north star set"). | Every coding/slash-cmd brief in `orchestrator-mode/workflows/dispatch.md`. |

## load(<project>) — procedure

1. **Locate file.** Try in order: `docs/NORTH_STAR.md`, `STRATEGY.md`, `.github/NORTH_STAR.md`, `docs/specs/NORTH_STAR.md`. Use the first that exists.
2. **Locate drawer.** `mempalace_search wing=<project> query="north-star"` → fetch the matching drawer.
3. **Drift check.**
   - If only one exists: use it; flag the missing surface for the next refresh.
   - If both exist: compare the body sections (ignore the drawer's `Source:` header line). If they match → no drift. If they diverge → set `drift: true` and surface the diff to the caller.
4. **Return** the content + state.

If neither surface exists: return `state: { missing: true }`. The caller decides whether to prompt the user to invoke [derive.md](derive.md).

## inject(<brief>) — procedure

Used by `orchestrator-mode/workflows/dispatch.md` brief templates. Prepends a `## Project north star` section right after the reporting-contract preamble.

Recommended shape — pasted at the top of every delegate brief:

```
## Project north star

Source: `<repo>/docs/NORTH_STAR.md` @ <sha>

<six sections, verbatim>

When implementation choices fork, pick the path that serves the mission for the target users without violating non-goals or constraints. Decision principles break ties.
```

Pass the file content by value — do NOT send only the path. Delegates may work in anvil worktrees with their own filesystem snapshot; the path may resolve to a different file. The brief embeds the canonical text at dispatch time so the agent acts on what the orchestrator sees.

If `load()` returned `missing: true`: prepend instead `## Project north star\n\nNot set for this project. Decide locally and report deviations via scratchpad for follow-up.` and flag this in the orchestrator's todo.

## Orchestrator-mode boot integration

`orchestrator-mode/SKILL.md` step 1 (the on-entry sequence) calls `load()`. The result drives one of three branches:

| `load()` result | Orchestrator behaviour |
|-----------------|------------------------|
| Exists, no drift | Acknowledge with one line: `North star loaded: <mission>. Acting autonomously per principles.` |
| Exists, drift | Print diff. Ask: "File and drawer disagree on <sections>. Reconcile via `/north-star` refresh, or pick one and continue?" |
| Missing | Ask once: "No north star for this project. Derive one now via `/north-star`, skip for this session, or skip permanently?" Respect the answer for the session. Never auto-derive. |

Why no auto-derive: silent file creation violates the user-approval gate the `derive.md` workflow exists to enforce. The boot prompt is the only acceptable surface.

## Autonomy contract

After a successful `load()`, the orchestrator should NOT ask "should I act autonomously?" or "what matters for this project?" — those answers are in the loaded content. It MAY still ask about:

- Locked decisions not covered by principles (new product fork).
- Irreversible actions (force-push, schema drop, paid-API spend).
- Reviewer panel composition for high-stakes plan reviews.

Why: the north star resolves direction and principle, not every operational choice. Autonomy is bounded by `Hard constraints` + `Decision principles`; outside those bounds the user is still the principal.

## Refresh trigger detection

When consulting, watch for signals that the north star is stale:

- A user directive contradicts a current decision principle.
- An "incident" or "postmortem" diary entry in the last 7 days touches mission / constraints / non-goals.
- A PR description repeatedly references a goal not in the current mission.

On any of these, surface to the user: "The north star may need refresh — <trigger>. Run `/north-star` refresh?" Do not auto-refresh.

## Verify

- `load()` returns within 1 turn (cached read; MemPalace search). No interactive prompts inside `load()` itself — those happen in the caller.
- `inject()` is idempotent: calling it on a brief that already contains a `## Project north star` section replaces in place, does not stack.
- A delegate brief that went through `inject()` always either contains the artefact verbatim OR the explicit "not set" notice. Never silently omitted.
