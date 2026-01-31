# Heartbeat Check - Task Dashboard

## Periodic Tasks
- Read `TASKS.md` and check the last update time.
- If it has been more than 4 hours since the last "Mission Control" ping (check `memory/heartbeat-state.json`), send a rich-text summary to Telegram.
- Check `dashboard.html` exists and is accessible for reference.
- **Export Agent Status**: Run `clawdbot sessions list --json` and filter for sub-agents. Save the distilled status (label, status, task) to `agents_status.json` for the frontend.

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
4. **Sub-Agent Monitoring**:
   - Use `clawdbot sessions list --json` to get session data.
   - Extract `key`, `updatedAt`, and `ageMs`. Determine "Status" (Running if `ageMs` < 60000, else Completed).
   - Use `aiberm/openai/gpt-5.2-codex` logic to map `key` labels to readable names and icons.
   - Write the list to `agents_status.json`.
5. Update `lastDashboardPing` in `memory/heartbeat-state.json`.
