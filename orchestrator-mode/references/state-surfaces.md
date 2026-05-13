# State surfaces

Four places state can live. Each has one job; don't double-write.

| Surface | Purpose | Lifetime | Read by |
|---|---|---|---|
| **Solo scratchpad** | Working artefact the next workflow step consumes (brainstorm→plan→review→impl). | Archive on workflow close. | Next-step agent; orchestrator on synthesis. |
| **Solo todo** | Actionable work with accept criteria. | Closed when done (with verification comment). | Orchestrator + fix agents. |
| **MemPalace drawer** | Durable cross-session knowledge: design decisions, verbatim user directives, postmortems, lessons. | Permanent. Update in place when fact evolves. | Any future session via `mempalace_search`. |
| **Repo `docs/`** | Shipping artefact versioned with code. | Versioned with codebase. | End users, future contributors. |
| **North star** (`docs/NORTH_STAR.md` + MemPalace mirror) | Decision rule the orchestrator and every delegate read at dispatch time. Mission, non-goals, constraints, principles. Not a roadmap. | Persistent; refresh in place via `/north-star` refresh workflow. | Orchestrator on boot; every delegate via dispatch.md brief injection. Authoring + refresh: `north-star` skill. |

## Scratchpad naming

```text
<kind>/<identifier>
  kind       = review | plan | audit | brainstorm | handoff | research | done
  identifier = stable: <repo>-pr-<N> | solo-<N> | <feature-slug>

Examples:
  review/naoray-gaze-pr-10
  review/naoray-gaze-pr-10-rereview
  audit/gaze-laravel
  brainstorm/solo-6
  plan/solo-6
  handoff/gaze-v03-cli-to-main
```

No date suffixes — `updated_at` already records time; dates rot when workflows span days.

## When to write what

- **Scratchpad:** another agent will read it; >200 words structured; survives PTY close.
- **MemPalace drawer:** durable rule, postmortem, design trade-off, verbatim user directive.
- **Solo todo:** concrete follow-up with acceptance criterion; >5 min agent work.
- **Repo `docs/`:** ships with code (specs, ADRs, user guides).
- **Throwaway:** stdout only.

## Lifecycle

- PR merges → archive review scratchpad(s).
- Solo todo closes → archive its brainstorm/plan/done scratchpads.
- Session start → `scratchpad_list`, prune anything from closed workflows.
- Re-review of same identifier → keep both with suffix (`-first-pass`, `-rereview`).
