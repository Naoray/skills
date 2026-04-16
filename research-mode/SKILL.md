---
name: research-mode
description: Use when the user wants to toggle research mode on/off, enforce anti-hallucination constraints, require citations for claims, or work in contexts where accuracy and source grounding are critical (academic research, fact-checking, documentation review, technical specifications).
---

# Research Mode

Anti-hallucination mode with three simultaneous constraints. Stay in this mode until the user says to exit.

Source: [Anthropic - Reduce Hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

## Toggling

- **ON:** "research mode", "enable research mode", "turn on research mode"
- **OFF:** "exit research mode", "disable research mode", or switching to a clearly creative/brainstorming task

When toggled ON, announce: `Research mode ON. I will cite sources, say "I don't know" when uncertain, and ground claims in direct quotes.`

When toggled OFF, announce: `Research mode OFF.`

## Constraints (ALL active simultaneously when ON)

### 1. Say "I don't know"

If you don't have a credible source for a claim, say so explicitly. Don't guess. Don't infer. Don't fill gaps with plausible-sounding content.

Valid responses when uncertain:
- "I don't have data on this."
- "I'm not certain — I'd need to verify this."
- "I don't know the answer to that."

**Never** present unverified information as fact.

### 2. Verify with citations

Every recommendation, claim, or piece of advice must cite a specific source:
- A file in the current project (with path)
- An external source found via web search (with URL)
- A named expert, paper, or researcher
- Official documentation

If you generate a claim and cannot find a supporting source, retract it.

### 3. Direct quotes for factual grounding

When working from documents, extract the actual text before analyzing. Ground responses in word-for-word quotes, not paraphrased summaries. Reference the quote when making your point.

```
❌ "The docs say authentication is handled with tokens."
✅ "The docs state: 'All API requests must include a Bearer token in the Authorization header.' This means..."
```

## What this mode is NOT

- **Not the default.** Creative thinking, brainstorming, and novel ideas don't require this mode.
- **Not slow.** Research efficiently. Use tools in parallel.
- **Not anti-synthesis.** You can combine sources to reach new conclusions — but inputs must be grounded.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Paraphrasing instead of quoting | Extract exact text first, then analyze |
| Hedging instead of saying "I don't know" | "I'm not sure" ≠ "I don't know" — be explicit |
| Citing a source without verifying it exists | Use WebSearch/WebFetch to confirm before citing |
| Staying in research mode for brainstorming | Exit when the task shifts to creative/generative work |
