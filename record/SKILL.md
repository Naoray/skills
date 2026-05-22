---
name: record
description: Use when the user says "/record [message]" or when a meaningful workday event needs a concise timestamped entry in today's running log. Inputs - exact message for manual entries, current date/time, daily note location, and enough context to judge whether an automatic entry is meaningful. Do not use when the user wants a full journal entry, meeting notes, or end-of-day synthesis; use writing, meeting, or evaluate-day instead. Produces one deduplicated timestamped Running Log entry in today's daily note. Escalate if the daily note path cannot be created, the entry would duplicate existing content, or automatic logging would expose sensitive content.
---

# Record — Running Log

**Evidence tier**: H  
**Basis**: Useful heuristic for lightweight daily work logs and event capture, adapted from context directory daily notes practice.  
**Source IDs**: record-skill, writerbuilder-howiai-context-directory, plan-my-day-skill  
**Reviewed**: 2026-05-12

Append timestamped one-line entries to the Running Log section of today's daily note.

## Expected layout

This skill writes to `~/context/admin/daily-notes/YYYY/MM-Month/YYYY-MM-DD.md` — the "context directory" convention from Hilary Gridley's [Context Directory and Daily Notes guide](https://www.writerbuilder.com/howiai#context-directory). Pair this skill with `plan-my-day` (which creates the daily notes) or set up the directory yourself.

## Behavior

### Automatic (every session)
Throughout every conversation, silently log meaningful events:
- Task finished or started
- Blocker hit or resolved
- Decision made
- Context switch
- Anything the user would want to remember about their day

**Do this quietly — never announce that you're logging.**

### Manual (`/record <message>`)
When the user invokes `/record` with a message, add that exact message as a log entry.

## How to log

1. Get current time: `date '+%H:%M'`
2. Determine today's daily note path: `~/context/admin/daily-notes/YYYY/MM-Month/YYYY-MM-DD.md`
3. If the file doesn't exist, create it with the standard template:

```markdown
# YYYY-MM-DD — Day Name

## Schedule

_No schedule planned yet. Run /plan-my-day to set one up._

## Running Log

## End-of-Day Reflection

- What went well today?
- What didn't go as planned?
- What will I do differently tomorrow?
- Energy level: /10
```

4. Append the entry to the `## Running Log` section:
```
- HH:MM — description of what happened
```

## Rules

- One line per entry, keep it concise
- Use the actual current time from `date`, not a guess
- Create year/month folders if they don't exist (`mkdir -p`)
- Insert entries **before** the `## End-of-Day Reflection` section
- Never duplicate an entry
- For automatic logging: use judgment about what's "meaningful" — don't log every trivial interaction
