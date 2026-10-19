// language: JavaScript, file: orb_farmer.js, target: Node.js 18+, GitHub Codespaces
// *reads credentials from secure environment variables to prevent token leakage*
const https = require('https');

const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    questIds: [
        "1549142163487592600",
        "1556778857481113610",
        "1555080843502813245",
        "1554689886835966094",
        "1551980932276293683"
    ],
    intervalMs: 30000
};

function sendHeartbeat(questId) {
    const payload = JSON.stringify({
        stream_key: `call:0:${questId}`,
        terminal: false
    });

    const options = {
        hostname: 'discord.com',
        port: 443,
        path: `/api/v9/quests/${questId}/heartbeat`,
        method: 'POST',
        headers: {
            'Authorization': CONFIG.token,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`[${new Date().toISOString()}] Quest ${questId} | Status: ${res.statusCode} | Response: ${body}`);
        });
    });

    req.on('error', (err) => {
        console.error(`[Error] Quest ${questId} failed: ${err.message}`);
    });

    req.write(payload);
    req.end();
}

if (!CONFIG.token) {
    console.error("[Fatal] DISCORD_TOKEN environment variable is not set.");
    process.exit(1);
}

console.log(`[Init] Firing parallel heartbeats for ${CONFIG.questIds.length} quests.`);

CONFIG.questIds.forEach(questId => {
    sendHeartbeat(questId);
    setInterval(() => sendHeartbeat(questId), CONFIG.intervalMs);
});
