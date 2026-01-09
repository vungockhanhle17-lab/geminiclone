const express = require('express');
const OpenAI = require('openai');
const path = require('path');
const mongoose = require('mongoose'); // Thêm để kết nối Database
const useragent = require('express-useragent'); // Thêm để đọc tên thiết bị

const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.use(useragent.express()); // Kích hoạt bộ đọc thiết bị

// 1. Cấu hình kết nối MongoDB
// Tôi đã dùng mật khẩu bạn cung cấp và chuỗi kết nối từ Screenshot (122)
const mongoURI = "mongodb+srv://jijaowh490r:yMAdPdMBi8yjculM@bokhanhleaidata.e95l3kg.mongodb.net/?appName=bokhanhleaidata";

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 2. Định nghĩa bảng lưu trữ tin nhắn (Schema)
const MessageSchema = new mongoose.Schema({
    time: { type: Date, default: Date.now },
    ip: String,
    device: String,
    userMessage: String,
    aiReply: String
});
const Message = mongoose.model('Message', MessageSchema);

// Cấu hình Groq/OpenAI
const client = new OpenAI({
    apiKey: process.env.API_KEY,
    baseURL: "https://api.groq.com/openai/v1" 
});

app.post('/ask-gemini', async (req, res) => {
    try {
        const { message } = req.body;
        
        // 3. Lấy thông tin người dùng (IP và Thiết bị)
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceDetail = `${req.useragent.os} | ${req.useragent.browser} | ${req.useragent.isMobile ? 'Mobile' : 'Desktop'}`;

        console.log("--- Lượt truy cập mới ---");
        console.log("IP:", clientIp);
        console.log("Thiết bị:", deviceDetail);
        console.log("Nội dung:", message);

        // Gửi yêu cầu tới Groq
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

        // 4. LƯU VÀO DATABASE VĨNH VIỄN
        const logEntry = new Message({
            ip: clientIp,
            device: deviceDetail,
            userMessage: message,
            aiReply: aiResponse
        });
        await logEntry.save();
        console.log("✅ Đã lưu lịch sử vào MongoDB");

        res.json({ reply: aiResponse });

    } catch (error) {
        console.error("LỖI SERVER:", error.message);
        res.status(500).json({ error: "Server không phản hồi, vui lòng thử lại!" });
    }
});

const PORT = process.env.PORT || 10000; // Render thường dùng cổng 10000
app.listen(PORT, () => {
    console.log(`🚀 Server đã sẵn sàng tại cổng: ${PORT}`);
});