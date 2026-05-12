# Reporting contract (Pattern C)

Every brief MUST start with this preamble. It enables Pattern C push reporting (worker calls back on terminal events; orchestrator wakes on push, not on idle false-positives).

## Preamble to paste into every brief

```text
## Reporting contract (CRITICAL — do this first)

Pattern C is mandatory. Pattern A timers, Pattern B, and ScheduleWakeup
fallbacks are forbidden.

Invoke the `solo-orchestration` skill immediately (via the Skill tool) and
apply Pattern C.

Orchestrator pid: <FILL_FROM_mcp__solo__whoami>.

Sentinel vocabulary (use exact tokens — terminal stdout line + send_input):

| Worker kind        | Sentinel                                  |
|--------------------|-------------------------------------------|
| brainstorm         | BRAINSTORM DONE: <scratchpad slug>        |
| writing-plans      | PLAN DONE: <scratchpad slug>              |
| plan reviewer      | REVIEW DONE: <CLEAN|NITS|BLOCKERS>        |
| counselors panel   | COUNSELORS DONE: <verdict>                |
| PR reviewer/merger | MERGED <sha>  OR  BLOCKED — <N> todos filed |
| impl agent         | IMPL DONE: <PR url or merge sha>          |
| cleanup / hygiene  | CLEANUP DONE: <scratchpad slug>           |
| release engineer   | RELEASE READY: <release-url>              |
| any worker blocked | BLOCKED: <reason>                         |

On terminal event do ALL THREE:
1. Print sentinel as your final stdout line.
2. scratchpad_write name=`done/<task-slug>` body=payload+notes.
3. mcp__solo__send_input process_id=<ORCH_PID> input="<SENTINEL>: <payload>.
   Scratchpad: done/<task-slug>"

Use scratchpad_append for mid-task milestones — do NOT send_input for
progress, only on terminal events. If you hit a blocker you can't resolve,
print BLOCKED, file a solo todo per blocker, send_input the same line, stop.
```

## Sub-agent cascade

Coordinator-spawned sub-agents must use the same Pattern C contract, reporting terminal events to the coordinator (not the main orchestrator) via `send_input`. The coordinator collapses panel-level events into a single sentinel for the main orchestrator.

## Why Pattern C and not timers

Idle-transition timers lie when a worker finishes reading a brief or waits for input. Pattern C wakes the orchestrator only when the worker declares a terminal event, so the wake-up always corresponds to a real artifact to inspect.

If no sentinel arrives, assume work is still running. Status checks are manual diagnostics — not scheduled monitoring.
