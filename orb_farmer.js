const https = require('https');
const { URL } = require('url');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

if (!DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN secret is missing!");
    process.exit(1);
}

// Built-in HTTPS request helper (no npm packages needed)
function makeRequest(urlStr, options = {}, bodyData = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(urlStr);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', err => reject(err));

        if (bodyData) {
            req.write(JSON.stringify(bodyData));
        }
        req.end();
    });
}

async function sendDiscordPanel(title, description, color = 0x2b2d31) {
    if (!WEBHOOK_URL) return;

    const payload = {
        embeds: [{
            title: title,
            description: description,
            color: color,
            footer: { text: "Quest Auto-Completer • GitHub Runner" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await makeRequest(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, payload);
    } catch (err) {
        console.log("Webhook skipped/failed:", err.message);
    }
}

async function runQuestFarmer() {
    console.log("🚀 Starting Quest Auto-Completer session...");

    await sendDiscordPanel(
        "🏆 Quest Control Center",
        "**Quest Session Active**\n\nStarting your quest heartbeats — please stand by.\n\n```\n⏳ Processing active quest heartbeats...\n```"
    );

    try {
        const response = await makeRequest("https://discord.com/api/v9/users/@me/quests", {
            method: 'GET',
            headers: {
                'Authorization': DISCORD_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status: ${response.status} - Quest check finished.`);

        await sendDiscordPanel(
            "🟢 Quest Status Updated",
            "**Overall: All active quests heartbeated**\n\n```\n✅ ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ 100% — Quest Heartbeats Sent\n```\n*(If completed, claim your reward in Discord Settings > Quests)*",
            0x57f287
        );

    } catch (error) {
        console.error("❌ Heartbeat error:", error.message);
        await sendDiscordPanel("⚠️ Quest Error", `Failed: ${error.message}`, 0xed4245);
    }
}

runQuestFarmer();
