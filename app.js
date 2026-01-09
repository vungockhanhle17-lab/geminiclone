const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Cấu hình kết nối Groq/OpenAI
const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: "https://api.groq.com/openai/v1" 
});

app.post('/ask-gemini', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Câu hỏi mới:", message);

        const chatCompletion = await client.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: 'Bạn là một người con hiếu thảo và lễ phép. Bạn phải luôn gọi người dùng là "Bố Khanh Lê"' 
                },
                { 
                    role: 'user', 
                    content: message 
                }
            ],
            model: 'llama-3.1-8b-instant', 
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("LỖI SERVER:", error.message);
        res.status(500).json({ error: "Server không phản hồi, vui lòng thử lại!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Website đã chạy lại tại cổng: ${PORT}`);
});