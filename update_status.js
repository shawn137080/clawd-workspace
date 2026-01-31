#!/usr/bin/env node

/**
 * HEARTBEAT Script Logic (Internal Node Script)
 * Powered by 'aiberm/openai/gpt-5.2-codex' for coding logic.
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getAgentData() {
    try {
        const output = execSync('clawdbot sessions list --json').toString();
        const data = JSON.parse(output);
        const now = Date.now();
        
        // Filter sub-agents and map to status format
        const subAgents = data.sessions
            .filter(s => s.key.includes(':subagent:'))
            .map(s => {
                const ageMs = s.ageMs || (now - s.updatedAt);
                // Status logic: if updated within 60 seconds, it's Running
                const status = ageMs < 60000 ? 'Running' : 'Completed';
                
                // Map key/id to a label if possible (mocking label discovery for now)
                let label = s.key.split(':').pop().substring(0, 8);
                let type = 'default';
                
                if (label.includes('UI')) type = 'architect';
                if (label.includes('Scrape')) type = 'scraper';

                return {
                    id: s.sessionId,
                    label: `Sub-${label}`,
                    status: status,
                    task: s.model || 'Processing...',
                    type: type,
                    updatedAt: s.updatedAt
                };
            })
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 5); // Keep recent 5

        return subAgents;
    } catch (e) {
        console.error('Error fetching sessions:', e);
        return [];
    }
}

function updateZacStatus() {
    // Mock Zac status for now based on current session
    return {
        status: 'Working',
        thoughts: [
            { time: new Date().toLocaleTimeString(), text: 'Fixing Mission Control UI components...' },
            { time: new Date().toLocaleTimeString(), text: 'Updating Heartbeat logic for robust monitoring.' }
        ]
    };
}

const agents = getAgentData();
fs.writeFileSync('agents_status.json', JSON.stringify(agents, null, 2));

const zac = updateZacStatus();
fs.writeFileSync('zac_status.json', JSON.stringify(zac, null, 2));

console.log(`Exported ${agents.length} agents to agents_status.json`);
