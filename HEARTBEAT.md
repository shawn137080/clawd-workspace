# Heartbeat Check - Task Dashboard

## Periodic Tasks
- **True Auto-Sync Check**:
  - Run `git pull` to fetch latest changes from `shawn137080/clawd-workspace` (specifically `TASKS.md`).
  - If remote changes detected, merge or overwrite local `TASKS.md` to ensure the workspace reflects UI updates made via GitHub API.
- Read `TASKS.md` and check the last update time.
- If it has been more than 4 hours since the last "Mission Control" ping (check `memory/heartbeat-state.json`), send a rich-text summary to Telegram.
- Check `dashboard.html` exists and is accessible for reference.
- **Export Status**:
  - Run `clawdbot sessions list --json` and filter for sub-agents. Save the distilled status (label, status, task) to `agents_status.json`.
  - Export current main agent (Zac) state to `zac_status.json`. Include current status (Thinking/Working) and a list of recent "thoughts" or activities derived from the session context or manual updates.

## Instructions
1. Check `memory/heartbeat-state.json` for `lastDashboardPing`.
2. Compare with current time.
3. If > 4 hours OR if specifically triggered by user:
   - Read `TASKS.md`, `ecommerce/RESEARCH_PLAN.md`, and `rental/PLAN.md`.
   - Update `dashboard.html` with current progress.
   - Send a "Mission Control" summary to Telegram including:
     - Active Projects status.
     - Next 3 immediate tasks.
     - Link to local `dashboard.html` (if on host).
4. **Agent Monitoring (Dual Export)**:
   - **Sub-Agents**: Use `clawdbot sessions list --json` to get session data. Extract `key`, `updatedAt`, and `ageMs`. Determine "Status" (Running if `ageMs` < 60000, else Completed). Use `aiberm/openai/gpt-5.2-codex` logic to map `key` labels to readable names and icons. Write to `agents_status.json`.
   - **Zac (Main Agent)**: Use `aiberm/claude-opus-4-5-20251101-thinking` for all reasoning and conversation.
- **Coding Tasks**: Always delegate to a sub-agent or use `aiberm/openai/gpt-5.2-codex` for logic/scripts.
5. Update `lastDashboardPing` in `memory/heartbeat-state.json`.
