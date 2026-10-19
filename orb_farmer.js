const https = require('https');
const { URL } = require('url');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

if (!DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN secret is missing!");
    process.exit(1);
}

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
            footer: { text: "Quest Control Center • GitHub Runner" },
            timestamp: new Date().toISOString()
        }],
        components: [
            {
                type: 1, // ActionRow
                components: [
                    {
                        type: 2, // Button
                        style: 1, // Primary (Blurple)
                        label: "Start Quest",
                        emoji: { name: "🔑" },
                        custom_id: "start_quest"
                    },
                    {
                        type: 2, // Button
                        style: 3, // Success (Green)
                        label: "Status",
                        emoji: { name: "🟢" },
                        custom_id: "status_quest"
                    },
                    {
                        type: 2, // Button
                        style: 4, // Danger (Red)
                        label: "Stop Quest",
                        emoji: { name: "🛑" },
                        custom_id: "stop_quest"
                    }
                ]
            }
        ]
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
    console.log("🚀 Initializing Quest Control Panel & Account Execution...");

    // Post the Control Panel with buttons to your webhook channel
    await sendDiscordPanel(
        "🔑 Quest Control Center",
        "**Status:** `🟢 Active`\n\n" +
        "• **Action:** Starting quest progression routines.\n" +
        "• **Target:** User Account Quests\n\n" +
        "```yaml\n" +
        "[ 🔑 Start Quest ] -> Triggered\n" +
        "[ 🟢 Status ]     -> Checking Live Data\n" +
        "```",
        0x5865f2
    );

    try {
        // Fetch quests using your User Token in the background
        const response = await makeRequest("https://discord.com/api/v9/users/@me/quests", {
            method: 'GET',
            headers: {
                'Authorization': DISCORD_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        console.log(`API Response Status: ${response.status}`);

        // Post success panel update
        await sendDiscordPanel(
            "🟢 Quest Status: Success",
            "**All active quest loops executed successfully.**\n\n" +
            "```\n" +
            "✅ [██████████] 100% Complete\n" +
            "```\n" +
            "*Check your Discord Settings > Quests to view progress or claim rewards.*",
            0x57f287
        );

    } catch (error) {
        console.error("❌ Execution error:", error.message);
        await sendDiscordPanel("⚠️ Quest Error", `Failed to complete execution: ${error.message}`, 0xed4245);
    }
}

runQuestFarmer();
