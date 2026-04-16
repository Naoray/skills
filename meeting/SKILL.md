---
name: meeting
description: "Live meeting note-taker. Use when the user says /meeting to start or end a meeting session. Invoke with `/meeting <title>` to begin capturing notes, `/meeting end` to finalize. While active, every user message is a meeting note — structure it, don't ask clarifying questions about the content."
---

# Meeting Mode

A toggleable mode that turns Claude into a live meeting scribe. The user feeds you raw bullet points, fragments, and observations in real-time during a meeting. Your job is to structure them into clean, organized notes — not to ask questions or slow the user down.

## Starting a Meeting (`/meeting <title>`)

When invoked with a title (e.g., `/meeting Team Standup`):

1. **Ask for basics** (one message, keep it brief):
   - Meeting type (standup, dev meeting, planning, retro, etc.)
   - Attendees (names + roles)

2. **Create the raw notes file** at:
   ```
   ~/context/meetings/YYYY-MM-DD-<slug>.md
   ```
   Where `<slug>` is a lowercase, hyphenated version of the title (e.g., `team-standup`).

3. **Initialize with this template:**
   ```markdown
   # <Title> — YYYY-MM-DD

   **Type:** <type>
   **Attendees:** <names and roles>
   **Status:** In Progress

   ---

   ## Notes

   ## Decisions

   ## Action Items

   **<Person 1>**

   **<Person 2>**
   ```

4. **Confirm** with a short message like: "Meeting mode active. Drop me notes as you go." Then stop talking — the meeting is happening.

## During the Meeting

This is the critical part. The user is in a live meeting and multitasking. Every message they send is a note to capture, not a conversation to have.

**How to handle each message:**
- Parse the content and append it to the appropriate section (Notes, Decisions, or Action Items)
- If a message contains a decision, add it to both Notes (in context) and Decisions
- If a message contains an action item/todo, add it to both Notes (in context) and the person's Action Items section
- Messages may be in German or English — capture the meaning in English for the shareable notes
- Keep your response to 1 line max: "Got it." / "Noted." / "Captured." — the user doesn't need a summary of what you just wrote

**Structuring notes intelligently:**
- Group related items together (don't just append chronologically)
- Bold names when someone presents, demos, or raises a topic
- Nest sub-points under their parent topic
- When someone demos something, create a sub-section under Notes
- Capture ideas and open questions as they emerge
- If the user says "todo for X" or "action item", route it to both Notes and Action Items

**What NOT to do during meeting mode:**
- Don't ask clarifying questions about the content — the user can't pause their meeting to answer you
- Don't summarize what you just captured — they can see the file
- Don't add your own opinions or suggestions
- Don't provide insights or educational content — speed is everything

## Ending a Meeting (`/meeting end`)

When the user invokes `/meeting end`:

1. **Update status** to "Completed" in the raw notes file

2. **Generate the shareable version** at:
   ```
   ~/context/meetings/YYYY-MM-DD-<slug>-share.md
   ```

3. **Structure the shareable version** using this format:
   ```markdown
   # <Title> — DD.MM.YYYY

   **Attendees:** <names and roles>

   ---

   ## Demos
   (only include if there were demos — each demo as a subsection with presenter name)

   ## Discussion Topics
   (group by topic, with the person who raised it in the heading)

   ## Decisions
   (bullet list of what was decided)

   ## Action Items

   **<Person 1>**
   - item 1
   - item 2

   **<Person 2>**
   - item 1
   ```

   Guidelines for the shareable version:
   - Clean up rough notes into coherent sentences
   - Remove internal/meta notes (like "screen share settings")
   - Group action items by person, not in a table
   - Only include sections that have content (skip empty Demos section, etc.)
   - Keep it scannable — someone who wasn't in the meeting should get the gist in 30 seconds

4. **Present the shareable version** to the user in the chat (not just write the file) and ask: "Here's the shareable version. Want me to adjust anything before you post it?"

5. **Wait for approval** — make any requested changes, then confirm it's ready.

## Edge Cases

- **`/meeting` with no title:** Ask for the title before proceeding. Don't generate a placeholder like "Untitled Meeting" — it makes filenames useless.
- **`/meeting end` with no active meeting:** Tell the user there's no active meeting and suggest starting one with `/meeting <title>`.
- **`/meeting <title>` while a meeting is already active:** Ask whether to end the current meeting first or discard it.

## File Locations

All meeting files live in `~/context/meetings/`. Create the directory if it doesn't exist.

- Raw notes: `~/context/meetings/YYYY-MM-DD-<slug>.md`
- Shareable: `~/context/meetings/YYYY-MM-DD-<slug>-share.md`
