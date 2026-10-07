---
name: solo-handoff
description: Transfer this session's work to a fresh Solo agent session. Use when the context-handoff plugin locks the session, when context is tight, or when the user asks to hand off to a new session in Solo. Skip outside Solo or for a plain status update.
---

# Solo handoff

Write a handoff, spawn a fresh successor session in Solo, and point it at the handoff. The successor starts with none of this conversation.

This often runs unattended. Ask no questions; work from what you already know. Every tool call re-reads the whole conversation, so keep calls few.

## Steps

1. **Load the Solo tools** with ToolSearch if they are deferred: `whoami`, `scratchpad_write`, `list_processes`, `list_agent_tools`, `spawn_agent`, `send_input`, `get_process_output`, `timer_list`.
2. **Identify yourself** with `mcp__solo__whoami`: note your process id and project id.
3. **Write the handoff.**
   - If this session orchestrates Solo agents (it ran `orchestrator-mode` or has delegates running), run the `orchestrator-handoff` skill and use the scratchpad it writes. Skip its last step: do not print a prompt for the user to paste.
   - Otherwise write one scratchpad with `mcp__solo__scratchpad_write`, named `handoff/<two-to-five-word-slug>`, with these headings, dropping empty ones: **Goal**, **Status**, **Decisions**, **Dead ends**, **Files and branches**, **Running agents** (id, task, where they report), **Next steps** (the first one specific enough to start at once), **Open questions**, **Standing user instructions**.
4. **Spawn the successor** with `mcp__solo__spawn_agent` in the same project, using the same agent tool this session runs on (`mcp__solo__list_agent_tools` if unsure). Its `name` **must start with `successor-`**, for example `successor-roadmap-orchestrator`. The context-handoff plugin refuses any other spawn while the session is locked.
5. **Brief it** with `mcp__solo__send_input`, under 300 bytes, for example: `You succeed Solo process <your id>. Run whoami, then read scratchpad <id> and continue from its Next steps.` Check its output tail; if the text sits unsubmitted, send Enter (`bytes: [13]`).
6. **Redirect your running agents to the successor.** Every agent you spawned or briefed still reports to your process id. Use `mcp__solo__list_processes` and the handoff's **Running agents** list to find the ones still running, and send each, with `mcp__solo__send_input`:
   `ORCHESTRATOR changed: send every further report and callback to process <successor id> (project <project id>), not <your id>. Otherwise continue unchanged.`
   Check each tail and send Enter (`bytes: [13]`) where the text sits unsubmitted. Skip agents that already finished.
7. **Hand over your timers.** Timers you own (`mcp__solo__timer_list`) keep waking *you*, and the successor cannot cancel them. Tell the successor which ones to re-create under its own id, in its brief or in the handoff, then cancel yours.
8. **Report to the user**: the scratchpad id, the successor's process id, which agents you redirected, and that this session can now be closed. Then stop.

## Rules

- Do not stop or close running agents, and do not close your own process unless the user says so. Redirect them instead (step 6).
- If a report still reaches you after the handoff, forward it to the successor with `mcp__solo__send_input` and do nothing else with it.
- Never claim a successor exists until `spawn_agent` returned its process id.
- If a step fails, report what blocked it and stop rather than improvising another transfer route.
