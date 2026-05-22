# Instruction Quality — writing the SKILL.md body

After the trigger contract decides whether the skill fires, the body decides whether the procedure actually runs correctly. Body quality is where most skills silently fail.

Drawn from *The Complete Guide to Building Skills for Claude* (Anthropic, 2026) plus practitioner experience.

## Core principles

### 1. Be specific and actionable

Bad:

```markdown
Validate the data before proceeding.
```

Good:

```markdown
Run `python scripts/validate.py --input {filename}` to check data format.
If validation fails, common issues include:
- Missing required fields (add them to the CSV)
- Invalid date formats (use YYYY-MM-DD)
```

The good version names the script, names the inputs, and lists the failure modes the model would otherwise have to guess.

### 2. Include error handling

```markdown
## Common Issues

### MCP Connection Failed
If you see "Connection refused":
1. Verify MCP server is running: Check Settings > Extensions
2. Confirm API key is valid
3. Try reconnecting: Settings > Extensions > [Your Service] > Reconnect
```

Error handling is part of the instructions, not a separate concern. If the failure mode is predictable, document the recovery path in the same file the procedure lives in.

### 3. Critical instructions go at the top

Buried instructions get skipped. Put the most important rules near the H1.

```markdown
# Skill Name

CRITICAL: Before any file work, run the fit gate. Stop if 2+ checks fail.

## Procedure
...
```

Use `## Important` or `## Critical` section headers when a rule is load-bearing. Repeat key points later in the document if they apply to multiple steps.

### 4. Reference bundled resources explicitly

```markdown
Before writing queries, consult `references/api-patterns.md` for:
- Rate limiting guidance
- Pagination patterns
- Error codes and handling
```

State the file path. State what's in it. State when to load it. The model will not go fishing for context.

### 5. Use progressive disclosure

`SKILL.md` is the body that loads when the skill triggers. It should be the **smallest** document that gets the procedure right. Move detail to `references/` and link to it:

```markdown
See `references/edge-cases.md` for the full list of failure modes.
```

Hard caps: target ≤200 lines, ceiling 500. Past that, you're loading detail that 80% of invocations won't need.

## Deterministic over aspirational

Language interpretation is non-deterministic. Code is. For checks that must pass the same way every time, bundle a script rather than describing the rule in prose.

**Aspirational (model re-derives the check every call):**
```markdown
Before creating the project, make sure:
- The name is reasonable
- The team is set up
- The dates make sense
```

**Deterministic (script does it the same way every time):**
```markdown
Run `python scripts/validate_project.py --name "$NAME" --team "$TEAM" --start "$START"`.
Exit code 0 = proceed. Non-zero = abort and show the error.
```

When to use each:
- **Prose rule** is fine for guidance the model can apply with judgment.
- **Bundled script** is required for hard invariants where divergent interpretations break the workflow.

Anthropic explicitly recommends scripts for critical validations: "Code is deterministic; language interpretation isn't."

## Voice and length

- **Imperative voice.** "Run the validator", not "you should run the validator".
- **Bullets and numbered lists** beat prose paragraphs for steps. The model parses them faster and skips them less.
- **Fragments OK** if the meaning is clear. Caveman-lite voice is fine across this registry.
- **No tutorial padding.** The future-agent reading the skill is smart. Explain only what it doesn't already know.

## MUST / ALWAYS / NEVER — always with a WHY

The model interprets unjustified all-caps imperatives as noise and routes around them. Always pair the imperative with a clause explaining the reason.

Bad:
```markdown
NEVER skip the validation step.
```

Good:
```markdown
NEVER skip the validation step. Why: the downstream API returns 500 on malformed payloads, and the error message does not identify which field was bad.
```

The WHY clause lets the model judge edge cases instead of mechanically applying the rule.

## Model laziness — encouragement belongs in prompts, not SKILL.md

Sometimes a skill triggers and the model still cuts corners — skips validation, summarizes instead of executing, etc. The instinct is to add encouragement to the body:

```markdown
## Performance Notes
- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps
```

Anthropic's empirical finding: **this is more effective when placed in the user prompt than in `SKILL.md`.** Body-level encouragement is read once and often discounted. Prompt-level encouragement is in the current turn's context window.

For a skill that recurrently triggers laziness, the right fix is usually:
1. A bundled script that does the work deterministically (model can't skip what the script does).
2. A documentation note suggesting users add encouragement to their prompts.

Adding more "please be thorough" to `SKILL.md` rarely helps.

## Iteration based on real feedback

Skills are living documents. After every real invocation, ask:
- Did the trigger fire when it should have? (If not → revise description.)
- Did the model follow the procedure? (If not → tighten instructions.)
- Did the model handle errors? (If not → add error-handling section.)
- Were users confused? (If yes → expand the description with their phrasing.)

The Anthropic-recommended iteration loop: *"Use the skill, encounter an edge case, bring that example back to skill-creator and ask: how would this skill have handled X?"* — that's how the body grows from a draft into a robust procedure.

## Pro tip: iterate on a single task first

Anthropic's strongest practitioner finding: "the most effective skill creators iterate on a single challenging task until Claude succeeds, then extract the winning approach into a skill." This leverages in-context learning and gives faster signal than broad testing.

Workflow:
1. Pick one realistic invocation.
2. Get it working manually with iterative prompting in a single session.
3. Capture the winning prompt + steps.
4. Generalize **only after** you have a working baseline.

Don't generalize first and then try to make it work. The model has trouble inferring a workflow from a skeleton; it has no trouble extracting a workflow from a known-good run.
