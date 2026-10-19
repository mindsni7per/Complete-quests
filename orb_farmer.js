// language: JavaScript, file: orb_farmer.js, target: GitHub Actions / Node.js
const fetch = require('node-fetch');

const TOKEN = process.env.DISCORD_TOKEN;
const QUEST_IDS = [
    "1549142163487592600",
    "1556778857481113610",
    "1555080843502813245",
    "1554689886835966094",
    "1551980932276293683"
];

async function sendHeartbeat(questId) {
    try {
        let payload = JSON.stringify({
            stream_key: `call:0:${questId}`,
            terminal: false
        });
        let res = await fetch(`https://discord.com/api/v9/quests/${questId}/heartbeat`, {
            method: 'POST',
            headers: {
                'Authorization': TOKEN,
                'Content-Type': 'application/json'
            },
            body: payload
        });
        console.log(`[Quest ${questId}] Status: ${res.status}`);
    } catch (e) {
        console.error(`[Quest ${questId}] Error:`, e.message);
    }
}

async function run() {
    if (!TOKEN) {
        console.error("Missing DISCORD_TOKEN secret.");
        process.exit(1);
    }
    console.log("Firing batch heartbeats...");
    for (let id of QUEST_IDS) {
        await sendHeartbeat(id);
    }
}

run();
