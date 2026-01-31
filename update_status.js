#!/usr/bin/env node

/**
 * HEARTBEAT Script Logic (Internal Node Script)
 * Powered by 'aiberm/openai/gpt-5.2-codex' for coding logic.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration for Document Scanning
const DOC_PATHS = [
    { dir: '.', pattern: /README\.md$/i },
    { dir: 'ecommerce', pattern: /\.md$/i },
    { dir: 'rental', pattern: /\.md$/i },
    { dir: 'memory', pattern: /\.md$/i },
    { dir: 'docs', pattern: /\.(md|txt)$/i }
];

function scanDocuments() {
    const docs = [];
    DOC_PATHS.forEach(config => {
        const fullPath = path.resolve(config.dir);
        if (!fs.existsSync(fullPath)) return;

        try {
            const files = fs.readdirSync(fullPath);
            files.forEach(file => {
                if (config.pattern.test(file)) {
                    const filePath = path.join(config.dir, file);
                    const stats = fs.statSync(filePath);
                    
                    // Simple title extraction (use filename if no header)
                    let title = file;
                    if (path.extname(file) === '.md') {
                        try {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const match = content.match(/^#\s+(.+)/m);
                            if (match) title = match[1];
                        } catch (e) {}
                    }

                    docs.push({
                        id: Buffer.from(filePath).toString('base64'),
                        title: title,
                        path: filePath,
                        created: stats.birthtime.toISOString(),
                        updated: stats.mtime.toISOString(),
                        size: stats.size,
                        category: config.dir === '.' ? 'Root' : config.dir
                    });
                }
            });
        } catch (e) {
            console.error(`Error scanning ${config.dir}:`, e);
        }
    });
    return docs.sort((a, b) => new Date(b.updated) - new Date(a.updated));
}

// Price estimates per 1M tokens (very rough approximation for dashboard display)
const PRICING = {
    'gemini-3-flash-preview': { input: 0.1, output: 0.4 },
    'deepseek-r1-distill-llama-70b': { input: 0.59, output: 0.79 },
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
    'default': { input: 0.5, output: 1.5 }
};

function getAgentData() {
    try {
        const output = execSync('clawdbot sessions list --json').toString();
        const data = JSON.parse(output);
        const now = Date.now();
        
        const sessionsDir = path.join(process.env.HOME, '.clawdbot/agents/main/sessions');

        const usageStats = [];
        const activityLog = [];

        const sessions = data.sessions.map(s => {
            const ageMs = s.ageMs || (now - s.updatedAt);
            const status = ageMs < 60000 ? 'RUNNING' : 'COMPLETED';
            
            const keyParts = s.key.split(':');
            let label = keyParts[keyParts.length - 1];
            const isSubagent = s.key.includes(':subagent:');
            const agentName = isSubagent ? `Sub-Agent (${label.substring(0,8)})` : 'Zac (Main)';
            
            if (!label || label.match(/^[0-9a-f-]{36}$/)) {
                label = isSubagent ? 'Specialist Agent' : 'Main Zac';
            }

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
            } catch (err) {}

            // Usage Stats Collection
            const modelKey = s.model || 'default';
            const pricing = PRICING[modelKey] || PRICING.default;
            const inputTokens = s.inputTokens || 0;
            const outputTokens = s.outputTokens || 0;
            const cost = ((inputTokens / 1000000) * pricing.input) + ((outputTokens / 1000000) * pricing.output);

            usageStats.push({
                task: task,
                agent: agentName,
                model: s.model || 'unknown',
                input: inputTokens,
                output: outputTokens,
                cost: cost.toFixed(4),
                timestamp: s.updatedAt
            });

            // Activity Log (only for reasonably recent or completed tasks)
            if (status === 'COMPLETED' || isSubagent) {
                activityLog.push({
                    timestamp: new Date(s.updatedAt).toISOString(),
                    agent: agentName,
                    action: task,
                    status: status
                });
            }

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
        });

        // Write Usage and Activity logs
        fs.writeFileSync('usage_stats.json', JSON.stringify(usageStats.sort((a,b) => b.timestamp - a.timestamp), null, 2));
        fs.writeFileSync('activity_log.json', JSON.stringify(activityLog.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)), null, 2));

        return sessions.filter(agent => agent.status === 'RUNNING');
    } catch (e) {
        console.error('Error fetching sessions:', e);
        return [];
    }
}

function updateZacStatus() {
    let existingZac = { status: 'Thinking', thoughts: [] };
    if (fs.existsSync('zac_status.json')) {
        try {
            existingZac = JSON.parse(fs.readFileSync('zac_status.json', 'utf8'));
        } catch (e) {}
    }

    const newThought = { 
        time: new Date().toLocaleTimeString(), 
        text: 'Synchronizing activity logs and token usage metrics for dashboard transparency.' 
    };
    
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

const docs = scanDocuments();
fs.writeFileSync('docs_index.json', JSON.stringify(docs, null, 2));

console.log(`Exported ${agents.length} active agents, ${docs.length} docs, usage_stats.json, and activity_log.json`);
