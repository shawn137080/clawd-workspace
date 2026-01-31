#!/usr/bin/env node

/**
 * HEARTBEAT Script Logic (Internal Node Script)
 * Powered by 'aiberm/openai/gpt-5.2-codex' for coding logic.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAgentData() {
    try {
        const output = execSync('clawdbot sessions list --json').toString();
        const data = JSON.parse(output);
        const now = Date.now();
        
        const sessionsDir = path.join(process.env.HOME, '.clawdbot/agents/main/sessions');

        const subAgents = data.sessions
            .filter(s => s.key.includes(':subagent:'))
            .map(s => {
                const ageMs = s.ageMs || (now - s.updatedAt);
                const status = ageMs < 60000 ? 'Running' : 'Completed';
                
                // 1. Extract Label from session key
                // Key format: agent:main:subagent:LABEL-OR-ID
                const keyParts = s.key.split(':');
                let label = keyParts[keyParts.length - 1];
                
                // Fallback for missing label
                if (!label || label.match(/^[0-9a-f-]{36}$/)) {
                    label = 'Specialist Agent';
                }

                // 2. Extract Task from session .jsonl file
                let task = 'Processing...';
                try {
                    const jsonlPath = path.join(sessionsDir, `${s.sessionId}.jsonl`);
                    if (fs.existsSync(jsonlPath)) {
                        const content = fs.readFileSync(jsonlPath, 'utf8');
                        const lines = content.split('\n');
                        for (const line of lines) {
                            if (!line.trim()) continue;
                            const entry = JSON.parse(line);
                            if (entry.type === 'message' && entry.message && entry.message.role === 'user') {
                                const textContent = entry.message.content.find(c => c.type === 'text');
                                if (textContent) {
                                    task = textContent.text.split('\n')[0].substring(0, 100);
                                    if (textContent.text.length > 100) task += '...';
                                    break;
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error reading task for ${s.sessionId}:`, err.message);
                }

                // 3. Determine Type based on label for icons
                let type = 'default';
                const lowerLabel = label.toLowerCase();
                if (lowerLabel.includes('debug') || lowerLabel.includes('fix')) type = 'debugger';
                else if (lowerLabel.includes('deploy')) type = 'deployer';
                else if (lowerLabel.includes('ui') || lowerLabel.includes('ux') || lowerLabel.includes('design')) type = 'uiux';
                else if (lowerLabel.includes('research') || lowerLabel.includes('search')) type = 'researcher';
                else if (lowerLabel.includes('code') || lowerLabel.includes('dev')) type = 'coder';

                return {
                    id: s.sessionId,
                    label: label,
                    status: status,
                    task: task,
                    type: type,
                    updatedAt: s.updatedAt
                };
            })
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 8); // Keep recent 8

        return subAgents;
    } catch (e) {
        console.error('Error fetching sessions:', e);
        return [];
    }
}

function updateZacStatus() {
    return {
        status: 'Working',
        thoughts: [
            { time: new Date().toLocaleTimeString(), text: 'Optimizing agent monitoring logic...' },
            { time: new Date().toLocaleTimeString(), text: 'Mapping session metadata to human-readable labels.' },
            { time: new Date().toLocaleTimeString(), text: 'Synchronizing UI components with live agent tasks.' }
        ]
    };
}

const agents = getAgentData();
fs.writeFileSync('agents_status.json', JSON.stringify(agents, null, 2));

const zac = updateZacStatus();
fs.writeFileSync('zac_status.json', JSON.stringify(zac, null, 2));

console.log(`Exported ${agents.length} agents to agents_status.json`);
