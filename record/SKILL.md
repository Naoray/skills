---
name: record
description: Silently append timestamped entries to today's daily note running log. Runs automatically throughout every session when meaningful events happen. Also invocable manually with /record.
---

# Record — Running Log

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
