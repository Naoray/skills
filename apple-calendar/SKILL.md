---
name: apple-calendar
description: Use when the user asks to list Apple Calendar calendars or events, create/update/delete events, search appointments, or manage recurrence in Calendar.app on macOS. Inputs - calendar name when needed, event UID for read/update/delete, event title, start/end times, location/description/recurrence details for writes. Do not use when the user needs Google/Outlook calendar APIs, cross-platform sync, or general scheduling advice; use a service-specific calendar integration instead. Produces Calendar.app script commands and parsed event/calendar results. Escalate if calendar permissions are missing, the target calendar is read-only, dates are ambiguous, or deleting a recurring event could remove an entire series.
metadata: {"clawdbot":{"emoji":"📅","os":["darwin"]}}
source:
  url: https://www.writerbuilder.com/howiai#connect-calendar
  author: Hilary Gridley
  note: Concept credit — original guide targets Google Calendar via MCP; this skill adapts the pattern for Apple Calendar.app via AppleScript
---

# Apple Calendar

**Evidence tier**: P
**Basis**: Practitioner workflow for macOS Calendar.app automation through AppleScript-backed shell commands.
**Source IDs**: skill apple-calendar scripts/cal-list.sh, scripts/cal-events.sh, scripts/cal-create.sh; WriterBuilder calendar-agent pattern
**Reviewed**: 2026-05-12

Interact with Calendar.app via AppleScript. Run scripts from: `cd {baseDir}`

## Commands

| Command | Usage |
|---------|-------|
| List calendars | `scripts/cal-list.sh` |
| List events | `scripts/cal-events.sh [days_ahead] [calendar_name]` |
| Read event | `scripts/cal-read.sh <event-uid> [calendar_name]` |
| Create event | `scripts/cal-create.sh <calendar> <summary> <start> <end> [location] [description] [allday] [recurrence]` |
| Update event | `scripts/cal-update.sh <event-uid> [--summary X] [--start X] [--end X] [--location X] [--description X]` |
| Delete event | `scripts/cal-delete.sh <event-uid> [calendar_name]` |
| Search events | `scripts/cal-search.sh <query> [days_ahead] [calendar_name]` |

## Date Format

- Timed: `YYYY-MM-DD HH:MM`
- All-day: `YYYY-MM-DD`

## Recurrence

| Pattern | RRULE |
|---------|-------|
| Daily 10x | `FREQ=DAILY;COUNT=10` |
| Weekly M/W/F | `FREQ=WEEKLY;BYDAY=MO,WE,FR` |
| Monthly 15th | `FREQ=MONTHLY;BYMONTHDAY=15` |

## Output

- Events/search: `UID | Summary | Start | End | AllDay | Location | Calendar`
- Read: Full details with description, URL, recurrence

## Notes

- Read-only calendars (Birthdays, Holidays) can't be modified
- Calendar names are case-sensitive
- Deleting recurring events removes entire series
