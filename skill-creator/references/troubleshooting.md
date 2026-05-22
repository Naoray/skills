# Troubleshooting — common skill failure modes

Drawn from *The Complete Guide to Building Skills for Claude* (Anthropic, 2026) and field experience. Each entry: symptom → root cause → fix. Match the symptom you're seeing; do not skim top-to-bottom.

## 1. Skill won't load / "Could not find SKILL.md in uploaded folder"

**Cause:** filename casing. The loader matches `SKILL.md` exactly.

**Fix:**
- Rename to `SKILL.md` (uppercase, `.md` lowercase).
- Verify: `ls -la <skill-folder>/` shows `SKILL.md` literally.
- `skill.md`, `Skill.md`, `SKILL.MD` will all silently fail.

## 2. "Invalid frontmatter"

**Cause:** YAML formatting — missing delimiters, unclosed quotes, tabs instead of spaces.

**Fix — common mistakes:**

```yaml
# Wrong — missing --- delimiters
name: my-skill
description: Does things

# Wrong — unclosed quotes
---
name: my-skill
description: "Does things
---

# Correct
---
name: my-skill
description: Does things
---
```

## 3. "Invalid skill name"

**Cause:** spaces, capitals, underscores, or a reserved prefix.

**Fix:**
```yaml
# Wrong
name: My Cool Skill        # spaces + capitals
name: my_cool_skill        # underscores
name: claude-helper        # reserved prefix
name: anthropic-tools      # reserved prefix

# Correct
name: my-cool-skill
```

## 4. Skill never triggers automatically

**Symptom:** users have to invoke the skill manually every time. Support questions about "when should I use this?"

**Cause:** description too vague, missing user-phrase triggers, or missing relevant file types.

**Debugging:** ask Claude `"When would you use the [skill name] skill?"` Claude will quote the description back. Listen for what is missing.

**Fix:**
- Add concrete trigger phrases users actually say.
- Mention file types if the skill operates on specific formats (`.fig`, `.csv`, `.docx`).
- Add domain keywords (proper nouns, jargon) so paraphrased requests match.

**Quick description checklist:**
- Is it too generic? ("Helps with projects" will never fire.)
- Does it include phrases users would actually type?
- Does it mention relevant file types?

## 5. Skill triggers too often (overreach)

**Symptom:** skill loads for unrelated queries. Users disable it. Confusion about its purpose.

**Cause:** description too broad, missing disqualifier, missing scope.

**Fix in order:**

1. **Add negative triggers** to the description:
   ```yaml
   description: Advanced data analysis for CSV files. Use for statistical modeling, regression, clustering. Do NOT use for simple data exploration (use data-viz skill instead).
   ```

2. **Narrow scope:**
   ```yaml
   # Too broad
   description: Processes documents

   # Better
   description: Processes PDF legal documents for contract review
   ```

3. **Clarify the slot:**
   ```yaml
   description: PayFlow payment processing for e-commerce. Use specifically for online payment workflows, not for general financial queries.
   ```

## 6. Instructions not followed (skill loads but Claude ignores it)

**Symptom:** skill triggers, but the procedure isn't applied.

**Common causes and fixes:**

**a. Instructions too verbose** — Claude skims long bodies. Keep instructions concise. Use bullet points and numbered lists. Move detail to `references/`.

**b. Instructions buried** — put critical instructions at the top. Use `## Important` or `## Critical` headers. Repeat key points if needed.

**c. Ambiguous language** — be deterministic, not aspirational:
```markdown
# Bad
Make sure to validate things properly

# Good
CRITICAL: Before calling create_project, verify:
- Project name is non-empty
- At least one team member assigned
- Start date is not in the past
```

**d. For critical validations, bundle a script** — code is deterministic; language interpretation isn't. If a check must pass exactly the same way every time, write a script and have the skill invoke it. Don't rely on the model to re-derive the rule.

**e. Model laziness** — add explicit encouragement, but put it in user prompts rather than `SKILL.md`. Anthropic's finding: prompt-level encouragement is more effective than body-level instructions like:
```markdown
## Performance Notes
- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps
```

## 7. MCP calls fail (skill loads but tool integration breaks)

**Checklist:**

1. **MCP server connected?** Claude.ai → Settings → Extensions → [Your Service]. Should show "Connected".
2. **Auth current?** API keys not expired, OAuth tokens refreshed, permissions/scopes granted.
3. **Test MCP independently** of the skill: ask Claude to call the MCP tool directly. If that fails, the issue is the MCP, not the skill.
4. **Tool names exact?** Tool names are case-sensitive. Check MCP server documentation.

## 8. Skill seems slow or responses degraded ("large context")

**Causes:**
- Skill body too large.
- Too many skills enabled simultaneously.
- All content loaded inline instead of progressively disclosed.

**Fixes:**

1. **Optimize SKILL.md size:**
   - Move detailed docs to `references/` and link, don't inline.
   - Keep `SKILL.md` under 5,000 words (Anthropic guidance).
   - Router-pattern split if approaching 200 lines.

2. **Reduce enabled skills:**
   - 20–50 simultaneously enabled is a soft ceiling — beyond that, retrieval gets noisy.
   - Disable rarely-used skills.
   - Consider grouping related capabilities into a kit.

## 9. Description longer than 1024 characters

**Symptom:** loader rejects the skill or silently truncates.

**Fix:** count chars before saving:
```bash
awk '/^description:/,/^---$/' SKILL.md | sed 's/^description: //' | head -c 2000 | wc -c
```

If over 1024, tighten. Move detail to body (which is loaded after trigger fires anyway). Keep the 5-part trigger contract but compress each part to its essential phrasing.

## 10. Forbidden character: `<` or `>` in frontmatter

**Symptom:** silent breakage or unexpected behavior after frontmatter edits.

**Cause:** XML angle brackets in `name` / `description` / `compatibility` — these can be parsed as instruction-bearing tags when frontmatter is injected into Claude's system prompt.

**Fix:** remove brackets. If you genuinely need them in prose, use Unicode look-alikes (`‹`, `›`) or rephrase.

## Iteration based on feedback

Skills are living documents. Iterate based on:

- **Undertriggering signals:** skill doesn't load when it should, users manually enable it, support questions about when to use it. → Add detail and keywords to the description.
- **Overtriggering signals:** loads for irrelevant queries, users disable it, confusion about purpose. → Add negative triggers, narrow scope.
- **Execution issues:** inconsistent results, user corrections needed. → Improve instructions, add error handling, bundle a script for deterministic checks.
