# Visual QA Principles

V1. Verify artifacts, not vibes. Every finding should tie to a screenshot,
recording, route, command, viewport, or state.

V2. High-severity visual issues block comprehension or action: overlap, clipping,
unreadable text, missing primary content, inaccessible controls, broken terminal
rendering.

V3. Responsive checks matter when layout changes with viewport or content length.

V4. State coverage matters more than page count. Empty, loading, error, auth, and
locale states often reveal visual bugs.

V5. Terminal review checks command readability: wrapping, alignment, ANSI color,
tables, prompts, spinners, and final state.

V6. Visual QA does not prove functional correctness. Say so when handing results
back.
