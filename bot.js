const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");

// Load JSON Data
const rawData = fs.readFileSync("mobile.json");
const mobiles = JSON.parse(rawData);

// Function to find the best matching mobile
function searchMobile(query) {
    query = query.toLowerCase().trim();

    let exactMatches = mobiles.filter(mobile =>
        mobile["Company Name"].toLowerCase().includes(query) || 
        mobile["Model Name"].toLowerCase().includes(query)
    );

    let similarMatches = mobiles.filter(mobile =>
        query.split(" ").some(word => 
            mobile["Company Name"].toLowerCase().includes(word) ||
            mobile["Model Name"].toLowerCase().includes(word)
        )
    );

    // If no exact match, suggest similar ones
    if (exactMatches.length === 0 && similarMatches.length > 0) {
        exactMatches = similarMatches.slice(0, 3); // Suggest top 3 similar results
    }

    if (exactMatches.length === 0) {
        return ["❌ No matching mobiles found! Try again with a different keyword."];
    }

    let messages = [];
    let currentMessage = "";

    exactMatches.forEach(mobile => {
        let searchQuery = encodeURIComponent(`${mobile["Company Name"]} ${mobile["Model Name"]}`);
        let flipkartLink = `https://www.flipkart.com/search?q=${searchQuery}`;
        let amazonLink = `https://www.amazon.in/s?k=${searchQuery}`;

        let mobileText = `📌 *Mobile Info Board - Premium Access* 🏆\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `📱 *${mobile["Company Name"]} - ${mobile["Model Name"]}*\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `🛠 *Specifications:*\n` +
                         `   • 💾 *RAM:* ${mobile["RAM"]}\n` +
                         `   • 🔋 *Battery:* ${mobile["Battery Capacity"]}\n` +
                         `   • ⚙️ *Processor:* ${mobile["Processor"]}\n` +
                         `   • 📸 *Camera:* ${mobile["Back Camera"]}\n\n` +
                         `💰 *Price Details:*\n` +
                         `   • 🇮🇳 *India:* ₹${mobile["Launched Price (India)"]}\n` +
                         `   • 🇺🇸 *USA:* $${mobile["Launched Price (USA)"]}\n` +
                         `   • 🇵🇰 *Pakistan:* PKR ${mobile["Launched Price (Pakistan)"]}\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `🔹 *Want to Buy This Phone?* Check the links below:\n` +
                         `🔗 [Flipkart](${flipkartLink})  |  [Amazon](${amazonLink})\n\n` +
                         `⚠️ *This bot is a premium service! To get full access, pay ₹450 and DM @nurag_jod*`;

        if ((currentMessage.length + mobileText.length) > 3500) {
            messages.push(currentMessage);
            currentMessage = "";
        }
        currentMessage += mobileText;
    });

    if (currentMessage.length > 0) {
        messages.push(currentMessage);
    }

    return messages;
}

// Set up Telegram bot
const BOT_TOKEN = "7476513239:AAGiPIRhETi06e78IxTNxnxfa4dZG1iZ0co";  // Replace with your token
const bot = new Telegraf(BOT_TOKEN);

// "/start" command - Introduction
bot.start(async (ctx) => {
    let startMessage = `🎉 *Welcome to Mobile Info Board!* 📱\n\n` +
                       `🔹 This bot helps you find mobile phone specifications, prices, and direct purchase links!\n\n` +
                       `✅ *How to Use:*\n` +
                       `   • Send any mobile brand or model name (e.g., "iPhone 15 Pro Max 256GB" or "Samsung Galaxy S24").\n` +
                       `   • Get full mobile specifications & prices in India, USA, and Pakistan.\n` +
                       `   • Direct purchase links for Flipkart & Amazon.\n\n` +
                       `💰 *Premium Access (₹450 One-Time Fee):*\n` +
                       `   • Unlock unlimited searches.\n` +
                       `   • Get the latest updates & exclusive deals.\n` +
                       `   • Click the button below to pay & access premium features!`;

    await ctx.replyWithMarkdown(startMessage, 
        Markup.inlineKeyboard([
            Markup.button.url("💰 Pay ₹450 & Get Access", "https://t.me/nurag_jod")
        ])
    );
});

// Handle user messages
bot.on("text", async (ctx) => {
    let query = ctx.message.text.trim();
    let results = searchMobile(query);

    for (let message of results) {
        await ctx.replyWithMarkdown(message, 
            Markup.inlineKeyboard([
                Markup.button.url("💰 Pay ₹450 & Get Access", "https://t.me/nurag_jod")
            ])
        );
    }
});

// Start the bot
bot.launch();
console.log("🤖 Mobile Info Board Bot is Running...");
