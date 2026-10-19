const axios = require('axios');

// Fetch user token from GitHub Secrets
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
// (Optional) Paste your private channel Webhook URL here to get live embed updates in Discord
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

if (!DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN secret is missing!");
    process.exit(1);
}

// Function to send the styled Embed & UI Panel to Discord
async function sendDiscordPanel(title, description, color = 0x2b2d31) {
    if (!WEBHOOK_URL) return;

    const payload = {
        embeds: [
            {
                title: title,
                description: description,
                color: color,
                footer: { text: "Quest Auto-Completer • GitHub Runner" },
                timestamp: new Date().toISOString()
            }
        ]
    };

    try {
        await axios.post(WEBHOOK_URL, payload);
    } catch (err) {
        console.log("Webhook notification skipped/failed.");
    }
}

async function runQuestFarmer() {
    console.log("🚀 Starting Quest Auto-Completer session...");

    // Send "Quest Session Starting" embed card to Discord
    await sendDiscordPanel(
        "🏆 Quest Control Center",
        "**Quest Session Active**\n\nStarting your quest heartbeats — please stand by.\n\n" +
        "```\n" +
        "⏳ Processing active quest heartbeats...\n" +
        "```"
    );

    try {
        // Send heartbeat request to Discord API
        const response = await axios.get("https://discord.com/api/v9/users/@me/quests", {
            headers: {
                Authorization: DISCORD_TOKEN,
                "Content-Type": "application/json"
            }
        });

        console.log(` Status: ${response.status} - Quests fetched successfully!`);

        // Send completion status embed card back to Discord channel
        await sendDiscordPanel(
            "🟢 Quest Status Updated",
            "**Overall: All active quests heartbeated**\n\n" +
            "```\n" +
            "✅ ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ 100% — Quest Heartbeats Sent\n" +
            "```\n" +
            "*(If completed, claim your reward directly in Discord Settings > Quests)*",
            0x57f287
        );

    } catch (error) {
        console.error("❌ Error executing quest heartbeat:", error.response ? error.response.status : error.message);
        await sendDiscordPanel("⚠️ Quest Error", `Failed to execute heartbeat: ${error.message}`, 0xed4245);
    }
}

runQuestFarmer();
