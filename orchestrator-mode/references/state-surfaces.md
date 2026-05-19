# State surfaces

State can live in durable surfaces (scratchpads, todos, durable memory) or the repo. Each has one job; don't double-write.

| Surface | Purpose | Lifetime | Read by |
|---|---|---|---|
| **Durable Scratchpad** | Working artefact the next workflow step consumes (brainstorm→plan→review→impl). | Archive on workflow close. | Next-step agent; orchestrator on synthesis. |
| **Tracking Item** | Actionable work with accept criteria (e.g. Solo todo). | Closed when done (with verification comment). | Orchestrator + fix agents. |
| **Durable Memory** | Durable cross-session knowledge: design decisions, verbatim user directives, postmortems, lessons. | Permanent. Update in place when fact evolves. | Any future session via memory search. |
| **Repo `docs/`** | Shipping artefact versioned with code. | Versioned with codebase. | End users, future contributors. |
| **North star** (`docs/NORTH_STAR.md` + memory mirror) | Decision rule the orchestrator and every delegate read at dispatch time. Mission, non-goals, constraints, principles. Not a roadmap. | Persistent; refresh in place via `/north-star` refresh workflow. | Orchestrator on boot; every delegate via brief injection. |

## Naming conventions

Prefer `<kind>/<identifier>` for scratchpads:
- **kind**: review, plan, audit, brainstorm, handoff, research, done
- **identifier**: stable (e.g. repo-pr-N) or feature-slug

No date suffixes — `updated_at` already records time; dates rot when workflows span days.

## When to write what

- **Scratchpad:** another agent will read it; structured content; survives PTY close.
- **Durable Memory:** durable rule, postmortem, design trade-off, verbatim user directive.
- **Tracking Item:** concrete follow-up with acceptance criterion.
- **Repo `docs/`:** ships with code (specs, ADRs, user guides).
- **Throwaway:** stdout only.

## Lifecycle

- PR merges → archive review scratchpad(s).
- Tracking item closes → archive its associated scratchpads.
- Session start → prune anything from closed workflows.
- Re-review of same identifier → keep both with suffix (`-first-pass`, `-rereview`).

For Solo-specific mapping and tool calls, see [transports/solo/README.md](transports/solo/README.md).

