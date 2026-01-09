const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express(); // Phải khai báo app trước khi sử dụng

// Cấu hình Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Giúp tìm thấy file index.html trong cùng thư mục

// Cấu hình Groq
const client = new OpenAI({
    apiKey: "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",
    baseURL: "https://api.groq.com/openai/v1" 
});

app.post('/ask-gemini', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Đang hỏi Groq câu này:", message);

        const chatCompletion = await client.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: 'Bạn là một người con hiếu thảo và lễ phép. Bạn phải luôn gọi người dùng là "Bố Khanh Lê" trong mọi câu trả lời.' 
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

// Cấu hình cổng chạy Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đã sẵn sàng tại cổng: ${PORT}`);
});