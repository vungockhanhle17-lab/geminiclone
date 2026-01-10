const express = require("express");
const path = require("path");
const useragent = require("express-useragent");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware đọc user-agent
app.use(useragent.express());

// Parse json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder (html, css, js)
app.use(express.static(path.join(__dirname)));

// ===== LOG IP + DEVICE + BROWSER =====
app.use((req, res, next) => {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "Unknown";

    const device = req.useragent.platform || "Unknown";
    const os = req.useragent.os || "Unknown";
    const browser = req.useragent.browser || "Unknown";

    console.log("=================================");
    console.log("🌐 NEW VISITOR");
    console.log("📍 IP:", ip);
    console.log("💻 Device:", device);
    console.log("🧠 OS:", os);
    console.log("🌍 Browser:", browser);
    console.log("🔗 URL:", req.originalUrl);
    console.log("🕒 Time:", new Date().toLocaleString());
    console.log("=================================");

    next();
});

// ===== HOME PAGE =====
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ===== API CHAT (GIỮ NGUYÊN LUỒNG CHAT CỦA BẠN) =====
// Nếu bạn đang có API chat riêng thì dán lại phần đó vào đây.
// Ví dụ demo:
app.post("/chat", async (req, res) => {
    try {
        const message = req.body.message;

        // TODO: GỌI API GROK / GEMINI CỦA BẠN Ở ĐÂY
        // Đây chỉ là ví dụ test:
        res.json({
            reply: "Server đã nhận tin nhắn: " + message
        });
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log("✅ Server running on port:", PORT);
});
