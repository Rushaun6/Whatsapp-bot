const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function bot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log("Bot is ON");
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    // --- MAIN MENU ---
    if (text.toLowerCase() === "menu" || text === "1") {
      await sock.sendMessage(from, {
        text: "📌 *MAIN MENU*\n\n1️⃣ Bot Info\n2️⃣ Services\n3️⃣ Developer\n\nReply with a number."
      });
      return;
    }

    // --- BOT INFO ---
    if (text === "1" || text.toLowerCase() === "bot info") {
      await sock.sendMessage(from, {
        text: "🤖 *Bot Info*\nThis is a WhatsApp bot created using Baileys + GitHub Actions."
      });
      return;
    }

    // --- SERVICES ---
    if (text === "2") {
      await sock.sendMessage(from, {
        text: "🛠 *Services Available*\n\n• Auto Replies\n• Menus\n• Custom Commands\n\nType *menu* to go back."
      });
      return;
    }

    // --- DEVELOPER ---
    if (text === "3") {
      await sock.sendMessage(from, {
        text: "👨‍💻 *Developer*\nCreated by your GitHub workflow bot.\nType *menu* to go back."
      });
      return;
    }

    // --- DEFAULT RESPONSE ---
    await sock.sendMessage(from, {
      text: "Type *menu* to see options 📍"
    });
  });
}

bot();
