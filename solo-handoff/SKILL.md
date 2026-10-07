---
name: solo-handoff
description: Transfer this session's work to a fresh Solo agent session and redirect its running agents. Use when context is tight, when the context-handoff plugin asks for a handoff, or when the user wants to continue in a new Solo session. Inputs - the conversation, Solo MCP. Do not use outside Solo, for a plain status update, or to write a handoff without a successor; use orchestrator-handoff or a handoff document instead. Produces a handoff scratchpad, a running successor, redirected agents. Escalate if spawning or briefing the successor fails.
---

# Solo handoff

**Evidence tier**: P
**Basis**: Practitioner-backed session handoff over Solo MCP, used live on a 1M-context orchestrator session.
**Source IDs**: Solo MCP process/scratchpad/timer tools; Naoray/skills orchestrator-handoff; context-handoff plugin.
**Reviewed**: 2026-10-07

Write a handoff, spawn a fresh successor session in Solo, and point it at the handoff. The successor starts with none of this conversation.

This often runs unattended. Ask no questions; work from what you already know. Every tool call re-reads the whole conversation, so keep calls few.

## Steps

1. **Load the Solo tools** with ToolSearch if they are deferred: `whoami`, `scratchpad_write`, `list_processes`, `list_agent_tools`, `spawn_agent`, `send_input`, `get_process_output`, `timer_list`, `timer_cancel`, and `mcp__context-handoff__handoff_complete` when the context-handoff plugin is installed.
2. **Identify yourself** with `mcp__solo__whoami`: note your process id and project id.
3. **Write the handoff.**
   - If this session orchestrates Solo agents (it ran `orchestrator-mode` or has delegates running), run the `orchestrator-handoff` skill and use the scratchpad it writes. Skip its last step: do not print a prompt for the user to paste.
   - Otherwise write one scratchpad with `mcp__solo__scratchpad_write`, named `handoff/<two-to-five-word-slug>`, with these headings, dropping empty ones: **Goal**, **Status**, **Decisions**, **Dead ends**, **Files and branches**, **Running agents** (id, task, where they report), **Next steps** (the first one specific enough to start at once), **Open questions**, **Standing user instructions**.
4. **Spawn the successor** with `mcp__solo__spawn_agent` in the same project, using the same agent tool this session runs on (`mcp__solo__list_agent_tools` if unsure). Name it `successor-<slug>`, for example `successor-roadmap-orchestrator`, so it is easy to spot.
5. **Brief it** with `mcp__solo__send_input`, under 300 bytes, for example: `You succeed Solo process <your id>. Run whoami, then read scratchpad <id> and continue from its Next steps.` Check its output tail; if the text sits unsubmitted, send Enter (`bytes: [13]`).
6. **Redirect your running agents to the successor.** Every agent you spawned or briefed still reports to your process id. Use `mcp__solo__list_processes` and the handoff's **Running agents** list to find the ones still running, and send each, with `mcp__solo__send_input`:
   `ORCHESTRATOR changed: send every further report and callback to process <successor id> (project <project id>), not <your id>. Otherwise continue unchanged.`
   Check each tail and send Enter (`bytes: [13]`) where the text sits unsubmitted. Skip agents that already finished.
7. **Hand over your timers.** Timers you own (`mcp__solo__timer_list`) keep waking *you*, and the successor cannot cancel them. Tell the successor which ones to re-create under its own id, in its brief or in the handoff, then cancel yours.
8. **Mark the handoff done.** If the `mcp__context-handoff__handoff_complete` tool exists (the context-handoff plugin), call it with `location: "scratchpad <id>"` and `successor: "process <id>"`.
9. **Report to the user**: the scratchpad id, the successor's process id, which agents you redirected, and that this session can now be closed. Then stop.

## Rules

- Do not stop or close running agents, and do not close your own process unless the user says so. Redirect them instead (step 6).
- After step 8 this session can no longer act when the context-handoff plugin is installed, so redirect every running agent first. A report that still reaches it afterwards is not lost: the successor reads that agent's todo.
- Never claim a successor exists until `spawn_agent` returned its process id.
- If a step fails, report what blocked it and stop rather than improvising another transfer route.
