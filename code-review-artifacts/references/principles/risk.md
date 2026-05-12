# Risk Principles

R1. Highest risk comes from changed behavior crossing external boundaries:
network, database, filesystem, auth, billing, privacy, queues, and subprocesses.

R2. Missing error handling matters most where failure is common or user-visible.

R3. Coupling is review-relevant when a layer knows details it should not know or
when a change forces unrelated modules to change together.

R4. Shared chunks are extraction candidates only when duplication creates
maintenance risk. Do not recommend abstractions for superficial similarity.

R5. Tests reduce uncertainty only when they exercise the changed behavior and
failure path.
