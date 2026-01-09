async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    const chatBox = document.getElementById('chat-box');

    if (!message) return;

    // 1. Hiển thị tin nhắn của Người dùng (Bố Khanh Lê)
    // Sử dụng ảnh user.png và bo tròn bằng class 'avatar'
    chatBox.innerHTML += `
        <div class="message user-message">
            <img src="user.png" class="avatar" alt="User">
            <div class="text">${message}</div>
        </div>
    `;

    // Xóa nội dung ô nhập và cuộn xuống dưới
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 2. Gửi yêu cầu đến Server Render
        const response = await fetch('/ask-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        // 3. Hiển thị tin nhắn trả lời của AI
        // Sử dụng ảnh gemini.png và bo tròn bằng class 'avatar'
        if (data.reply) {
            chatBox.innerHTML += `
                <div class="message bot-message">
                    <img src="gemini.png" class="avatar" alt="AI">
                    <div class="text">${data.reply}</div>
                </div>
            `;
        } else {
            throw new Error("Không nhận được phản hồi từ AI");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        chatBox.innerHTML += `
            <div class="message bot-message">
                <img src="gemini.png" class="avatar" alt="AI">
                <div class="text" style="background: #ff4d4d;">Ôi, có lỗi rồi bố ạ. Bố thử lại giúp con nhé!</div>
            </div>
        `;
    }

    // Luôn cuộn xuống dưới cùng sau khi tin nhắn mới xuất hiện
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Hỗ trợ nhấn phím Enter để gửi tin nhắn cho nhanh
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});