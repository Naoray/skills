# Reporting contract (Pattern C)

Every brief MUST start with a reporting preamble. It enables Pattern C push reporting (worker calls back on terminal events; orchestrator wakes on push, not on idle false-positives).

## Role Discipline

Pattern C is the primary monitoring strategy. Timers allowed as a safety net for **external** state (CI, deploy, network polling), but never as a substitute for push when push is available.

Worker-to-orchestrator signal:
1. Worker identifies the orchestrator (e.g. via PID).
2. Worker applies Pattern C via its local tooling.
3. On terminal events (DONE/BLOCKED/MERGED), the worker pushes a signal.

Sentinel vocabulary (use exact tokens — terminal stdout line + push signal):

| Worker kind        | Sentinel                                  |
|--------------------|-------------------------------------------|
| brainstorm         | BRAINSTORM DONE: <payload>                |
| writing-plans      | PLAN DONE: <payload>                      |
| plan reviewer      | REVIEW DONE: <CLEAN|NITS|BLOCKERS>        |
| counselors panel   | COUNSELORS DONE: <verdict>                |
| PR reviewer/merger | MERGED <sha>  OR  BLOCKED — <N> items filed |
| impl agent         | IMPL DONE: <PR url or merge sha>          |
| cleanup / hygiene  | CLEANUP DONE: <payload>                   |
| release engineer   | RELEASE READY: <release-url>              |
| any worker blocked | BLOCKED: <reason>                         |

## Sub-agent cascade

Coordinator-spawned sub-agents must use the same Pattern C contract, reporting terminal events to their coordinator via transport-specific push signals. The coordinator collapses panel-level events into a single sentinel for the main orchestrator.

## Why Pattern C and not timers

Idle-transition timers lie when a worker finishes reading a brief or waits for input. Pattern C wakes the orchestrator only when the worker declares a terminal event, so the wake-up always corresponds to a real artifact to inspect.

If no signal arrives, assume work is still running. Status checks are manual diagnostics — not scheduled monitoring.

For Solo-specific tool calls and preamble text, see [transports/solo.md](transports/solo.md).
