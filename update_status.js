#!/usr/bin/env node

/**
 * HEARTBEAT Script Logic (Internal Node Script)
 * Powered by 'aiberm/openai/gpt-5.2-codex' for coding logic.
 * 
 * Requirements:
 * 1. Filter to Running Only: Only include agents if status is 'RUNNING'.
 * 2. Immediate Cleanup: Completed agents (ageMs > 60000) removed immediately.
 * 3. Zac Status Persistent: Zac stays in zac_status.json regardless of sub-agents.
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
                // Status is 'RUNNING' only if updated within the last 60 seconds
                const status = ageMs < 60000 ? 'RUNNING' : 'COMPLETED';
                
                // Extract Label from session key
                const keyParts = s.key.split(':');
                let label = keyParts[keyParts.length - 1];
                
                if (!label || label.match(/^[0-9a-f-]{36}$/)) {
                    label = 'Specialist Agent';
                }

                // Extract Task from session .jsonl file
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
                    // Silently fail task extraction
                }

                // Determine Type based on label
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
                    updatedAt: s.updatedAt,
                    ageMs: ageMs
                };
            })
            .filter(agent => agent.status === 'RUNNING') // Filter to Running Only & Immediate Cleanup
            .sort((a, b) => b.updatedAt - a.updatedAt);

        return subAgents;
    } catch (e) {
        console.error('Error fetching sessions:', e);
        return [];
    }
}

function updateZacStatus() {
    // Zac status is persistent and independent of sub-agents
    // We update thoughts or keep current ones if they exist
    let existingZac = { status: 'Thinking', thoughts: [] };
    if (fs.existsSync('zac_status.json')) {
        try {
            existingZac = JSON.parse(fs.readFileSync('zac_status.json', 'utf8'));
        } catch (e) {}
    }

    const newThought = { time: new Date().toLocaleTimeString(), text: 'Monitoring sub-agent lifecycle and cleaning up completed sessions.' };
    
    // Maintain a rolling log of 10 thoughts
    const thoughts = [...(existingZac.thoughts || []), newThought].slice(-10);

    return {
        status: 'Working',
        thoughts: thoughts
    };
}

const agents = getAgentData();
fs.writeFileSync('agents_status.json', JSON.stringify(agents, null, 2));

const zac = updateZacStatus();
fs.writeFileSync('zac_status.json', JSON.stringify(zac, null, 2));

console.log(`Exported ${agents.length} active agents to agents_status.json`);
