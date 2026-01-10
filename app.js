const express = require('express');
const path = require('path');
const axios = require('axios'); // Dùng axios để gọi API cho đơn giản
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình Grok API
const GROK_API_KEY = process.env.GROK_API_KEY; 
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // 1. Kiểm tra API KEY
        if (!GROK_API_KEY) {
            console.error("Lỗi: Chưa cấu hình GROK_API_KEY trong Environment Variables.");
            return res.json({ reply: "Server thiếu API KEY của Grok. Bố kiểm tra lại trên Render nhé!" });
        }

        if (!userMessage) {
            return res.status(400).json({ reply: "Tin nhắn không được để trống." });
        }

        // 2. Gọi API của Grok (xAI)
        const response = await axios.post(
            GROK_API_URL,
            {
                model: "grok-2-latest", // Hoặc "grok-beta"
                messages: [
                    { role: "system", content: "Con là một trợ lý AI lễ phép, luôn gọi người dùng là Bố và xưng con." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${GROK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // 3. Trả kết quả về giao diện
        const aiReply = response.data.choices[0].message.content;
        res.json({ reply: aiReply });

    } catch (error) {
        console.error("Lỗi Grok API:", error.response ? error.response.data : error.message);
        res.status(500).json({ reply: "Con đang gặp chút sự cố kết nối, Bố thử lại sau nhé!" });
    }
});

app.listen(port, () => {
    console.log(`Server chạy tại: http://localhost:${port}`);
});