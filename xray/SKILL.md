---
name: xray
description: Use when the user wants to understand how their codebase works, see execution flows as ASCII diagrams, review architecture after shipping features, or says "xray", "show me the flows", "what does this app actually do", "architecture review". Proactively suggest after 3+ PRs merged since last run.
---

# X-Ray

Stop and see how the codebase actually works. Generates ASCII flow diagrams for every entry point, then evaluates each flow for structural problems. Language-agnostic — works on any project.

Designed for the person who doesn't read the code but needs to understand the architecture to make good decisions.

## Proactive Trigger

At session start (during `/recap` or similar), check if an x-ray is due:

```bash
# Check for .xray-meta.json in docs/diagrams/
# If it exists, compare last_run_commit to current HEAD
# Count PRs/commits since last run
```

**Suggest an x-ray when:**
- 3+ PRs merged since last run
- 20+ files changed since last run
- A new entry point (command, route, handler) was added
- No previous x-ray exists

**Nudge format:**
```
N PRs merged since your last x-ray (X days ago).
M flows likely affected: [list].
Run /xray to check the architecture?
```

Never auto-run. The user decides.

## Phase 1: Discover Entry Points

Launch a **single subagent** (research only, no changes) to discover all user-facing entry points.

**Subagent prompt:**
> Find all user-facing entry points in this codebase. An entry point is anything a user or system triggers directly: CLI commands, HTTP routes/controllers, event listeners, queue jobs, scheduled tasks, console commands, API endpoints, webhook handlers.
>
> For each entry point, return:
> - **Name**: human-readable label (e.g., "sync command", "POST /orders")
> - **File**: where it starts (e.g., `cmd/sync.go`, `app/Http/Controllers/OrderController@store`)
> - **Type**: command | route | job | listener | schedule | other
>
> Read project config (CLAUDE.md, package.json, composer.json, go.mod, etc.) to understand the project type. Follow the framework's conventions to find entry points.

## Phase 2: Scope

Determine which flows to diagram.

1. Read `docs/diagrams/.xray-meta.json` for the last run commit (if it exists)
2. Run `git log --oneline <last_commit>..HEAD --name-only` to find changed files
3. Map changed files to the entry points they belong to — these are "changed flows"
4. If no previous x-ray exists, all flows are "changed"

**Present the scope:**
```
Found N entry points. M have changed since last x-ray.

Changed flows:
  - sync command (5 files changed)
  - add command (new)
  - list command (2 files changed)

Generating diagrams for these 3 flows.
After review, I can show the remaining N flows too.
```

## Phase 3: Generate ASCII Diagrams

Launch **one subagent per flow** in parallel. Each subagent traces the execution path and produces an ASCII diagram.

**Subagent prompt (per flow):**
> Trace the full execution path for [entry point name] starting at [file].
> Follow every function call through the layers until the flow terminates (response sent, side effect complete, error returned).
>
> Produce an ASCII flow diagram showing:
> - **Input** at the top (args, request body, event payload)
> - **Each processing step** as a box with a plain-English label (NOT code — "Load user config" not `config.Load()`)
> - **Decision points** as diamonds or branching paths with YES/NO labels
> - **Error paths** shown explicitly — if an error is swallowed, show a dead-end box labeled "error discarded"
> - **External calls** (DB, API, file I/O, queue) in double-bordered boxes: `╔══════╗`
> - **Output** at the bottom (response, state changes, side effects)
>
> Rules:
> - Top-to-bottom flow, left-to-right for parallel branches
> - Max 80 chars wide
> - Plain English labels only — the reader does not know the programming language
> - Every error must go somewhere visible. A swallowed error is a dead-end box, not invisible.
> - Group related steps when they're trivially sequential (don't show every line of code)

**Output**: Each diagram is written to `docs/diagrams/<flow-name>.md` AND printed to the conversation.

Overwrite existing diagrams — they represent the current state, not history.

## Phase 4: Present Diagrams

Print all generated diagrams to the conversation, one after another. Add a one-line summary above each:

```
### sync command
Syncs local skills to match team registries. 6 steps, 2 external calls.

[diagram]

### add command
Adds a skill to a team registry on GitHub. 9 steps, 3 external calls.

[diagram]
```

After all diagrams are shown, ask:
```
Want to see the remaining N flows, or proceed to evaluation?
```

If the user wants more flows, generate those and present them before evaluating.

## Phase 5: Evaluate Flows

Launch **6 evaluator subagents in parallel**, one per concern. Each evaluator reviews ALL diagrammed flows.

Each evaluator receives: the ASCII diagrams AND the actual source code for each flow.

### Evaluator A: Redundancy
> Find steps that duplicate work: re-fetching the same data, re-parsing something already parsed, re-computing a value that's available. Look across flows too — if two flows fetch the same config independently, that counts.
> Return findings with confidence (high/medium/low). Only return findings where you can point to the specific duplicate steps.

### Evaluator B: Dead Ends
> Find errors that go nowhere: errors assigned to `_`, empty catch blocks, results discarded, paths that terminate without surfacing the failure. A "dead end" means the user or system has no way to know something went wrong.
> Also flag: return values ignored, API responses not checked, file operations without error handling.

### Evaluator C: Coupling
> Find places where one layer knows too much about another's internals: a command handler doing business logic, a storage layer generating format-specific output, a core package importing a presentation package. Wrong-direction dependencies.
> Reference the flow diagram to show which boxes shouldn't be connected.

### Evaluator D: Shared Chunks
> Find sequences of 3+ steps that appear in multiple flows. If connect and create-registry both do "load config, validate repo, fetch manifest, sync" — that's a shared chunk worth extracting.
> Show the shared steps side-by-side from each flow.

### Evaluator E: Missing Paths
> Find flows missing: error handling for external calls, timeout/cancellation support, fallback behavior on failure, empty-state handling (what happens when there's no data?).
> Focus on external calls (DB, API, file I/O) — these are where failures actually happen.

### Evaluator F: Unnecessary Steps
> Find flows that pass data through layers it doesn't need, over-abstract simple operations, or have wrapper functions that add no value. If data goes A → B → C → D but B and C just forward it, that's unnecessary.

## Phase 6: Present Findings

Group findings by type across all flows. Only show high-confidence findings by default.

```
## X-Ray Summary

Flows reviewed: N (M changed, K requested)
Findings: X high, Y medium

### Dead ends (2)
- **sync**: Save() error discarded after install loop — failure invisible to user
- **connect**: network failure during auto-sync has no recovery path

### Shared chunks (1)
- **connect + create-registry**: 5 identical steps (load config → validate → fetch manifest → save → sync) → candidate for extraction

### Coupling (1)
- **store**: generates Cursor-specific .mdc format — presentation concern in storage layer

Show medium-confidence findings? [y/n]
```

Each finding references the diagram step, not a line number.

## Phase 7: User Decides

The user chooses what to do. Options:

- **Fix specific findings**: "Fix the dead ends" → create a branch, implement fixes, test, PR
- **Expand scope**: "Show me all flows" or "Show medium findings too"
- **Refactor**: "Extract that shared chunk" → create a branch, refactor, test, PR
- **Nothing**: "Just wanted to see it" → done
- **Specific request**: "That coupling in the store bothers me, fix it"

Fixes follow normal workflow: branch, implement, test, PR.

## Phase 8: Persist Metadata

After the run completes (whether or not fixes were made), write tracking metadata:

**File**: `docs/diagrams/.xray-meta.json`
```json
{
  "last_run": "2026-04-01T10:30:00Z",
  "last_commit": "abc1234",
  "flows_reviewed": ["sync", "add", "list", "connect"],
  "findings_count": { "high": 3, "medium": 5 },
  "project_entry_points": 6
}
```

Commit the updated diagrams and metadata together.

On the next run, diff new diagrams against the old ones to show what changed structurally.
