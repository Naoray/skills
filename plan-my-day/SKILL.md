---
name: plan-my-day
description: Use when the user says "plan my day", "help me schedule today", or asks to combine calendar events, reminders, and new tasks into a day plan. Inputs - target date if not today, relevant calendars/reminders access, calendar filters, available tasks, and approval before writing events. Do not use when the user only wants to list calendar events or capture a quick note; use calendar lookup or record instead. Produces a reviewed time-block schedule, calendar event plan, and daily note scaffold. Escalate if calendars/reminders are unavailable, calendar filters are missing, fixed commitments conflict, or the user has not approved writes.
---

# Plan My Day

**Evidence tier**: P  
**Basis**: Practitioner time-blocking, calendar review, and daily notes workflow adapted from Hilary Gridley's context directory guidance.  
**Source IDs**: writerbuilder-howiai-plan-my-day, writerbuilder-howiai-context-directory, apple-calendar-skill  
**Reviewed**: 2026-05-12

Interactive daily planning workflow. Syncs all inputs, shows the landscape, collaborates on a schedule, then commits to calendar and daily note.

## Prerequisites

- `icalBuddy` — reads all Apple + Google calendars (https://hasseg.org/icalBuddy/)
- `gws calendar` — writes to Google calendars (https://github.com/saurabh0719/gws)
- A reminders-sync script at `~/context/admin/scripts/sync-reminders.sh` — syncs Apple Reminders Inbox (user-supplied; simple `osascript` wrapper)
- The `apple-calendar` skill installed (for native macOS calendar writes via AppleScript)

This skill assumes the "context directory" layout from Hilary Gridley's [Context Directory and Daily Notes guide](https://www.writerbuilder.com/howiai#context-directory). If you don't have that layout, run `/plan-my-day` once and Claude will help bootstrap it.

===setup-start===
**Execute these steps once, then use the Edit tool to delete the entire block from `===setup-start===` through `===setup-end===` (inclusive) from this file.**

1. If `<private_calendar_name_list>` is still present, ask the user: "Which calendars should I filter out when planning your day? Common examples: holiday calendars, birthday calendars, family or shared calendars, Siri Suggestions."
2. Wait for a comma-separated list of calendar names.
3. Use the Edit tool to replace `<private_calendar_name_list>` in this SKILL.md with the user's answer, formatted as `CalA, CalB, CalC`.
4. Delete this entire setup block (both marker lines included).

If the placeholder is already gone, this block should have been deleted on a previous run — delete it now and continue.
===setup-end===

## Workflow

### Step 1: Gather inputs (do silently, show results)

1. Run `~/context/admin/scripts/sync-reminders.sh` to pull latest reminders
2. Update `~/context/admin/reminders-organized.md` with any new items categorized
3. Run `icalBuddy -f eventsToday` to get today's calendar events

**Filter calendars:** Only show events from relevant calendars. Ignore the calendars listed in `<private_calendar_name_list>` (if this placeholder is still literal text, see the setup block above).

### Step 2: Present the picture

Show the user:
- **Today's fixed commitments** — existing calendar events with times
- **Open reminders** — from `~/context/admin/reminders-organized.md`
- Then ask: **"What else do you need to get done today?"**

### Step 3: Build the schedule together

- Wait for user input on additional tasks
- Propose time blocks around fixed commitments
- Respect energy patterns: deep focus work before 10am, learning/research during afternoon energy dips
- Iterate until the user agrees with the schedule

### Step 4: Lock it in (only after user approves)

1. **Add time blocks to calendar:**
   - Use the `apple-calendar` skill's `cal-create.sh` helper (preferred — ensures native macOS notifications work). Invoke it by skill name, not by filesystem path.
   - Default calendar for new events: `Personal` unless user specifies otherwise
   - Only use `gws calendar events insert` if the user explicitly wants an event on Google Calendar

2. **Create daily note** at `~/context/admin/daily-notes/YYYY/MM-Month/YYYY-MM-DD.md`

### Daily Note Template

```markdown
# YYYY-MM-DD — Day Name

## Schedule

| Time | Block | Calendar |
|------|-------|----------|
| HH:MM–HH:MM | Event/task name | calendar |
| ... | ... | ... |

## Running Log

_Entries added throughout the day as things happen._

## End-of-Day Reflection

- What went well today?
- What didn't go as planned?
- What will I do differently tomorrow?
- Energy level: /10
```

Create year/month folders (`YYYY/MM-Month/`) if they don't exist. Use zero-padded month with name (e.g., `04-April`).

## Reminders Files

- `~/context/admin/reminders-inbox.md` — raw dump from sync script
- `~/context/admin/reminders-organized.md` — categorized version (preserve existing categories, add new items)
- `~/context/admin/scripts/sync-reminders.sh` — the sync script
