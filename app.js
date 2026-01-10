const express = require("express");
const path = require("path");
const useragent = require("express-useragent");

// Nếu Node < 18 thì dùng:
// const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
const GROK_API_KEY = process.env.GROK_API_KEY;

// ===== BASIC SETUP =====
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// ===== HOME =====
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ===== CHAT ENDPOINT (GIỮ TÊN /ask-gemini) =====
app.post("/ask-gemini", async (req, res) => {
    try {
        if (!GROK_API_KEY) {
            console.error("❌ Missing GROK_API_KEY");
            return res.status(500).json({ reply: "Server thiếu API KEY." });
        }

        const userMessage =
            req.body.message ||
            req.body.prompt ||
            req.body.text ||
            "";

        if (!userMessage) {
            return res.json({ reply: "Bạn chưa nhập nội dung." });
        }

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Grok API error:", data);
            return res.json({
                reply: "AI đang bận hoặc lỗi API. Vui lòng thử lại."
            });
        }

        const reply =
            data.choices?.[0]?.message?.content ||
            "AI không có phản hồi.";

        res.json({ reply });

    } catch (err) {
        console.error("❌ Server error:", err);
        res.status(500).json({
            reply: "Server gặp lỗi. Vui lòng thử lại sau."
        });
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log("✅ Server running on port:", PORT);
});

