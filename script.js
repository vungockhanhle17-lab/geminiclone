const chatInput = document.querySelector("#prompt");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#toggleTheme");
const deleteButton = document.querySelector("#clearChat");

let userText = null;

const createChatDiv = (content, className) => {
    const div = document.createElement("div");
    div.classList.add("chat", className);
    div.innerHTML = content;
    return div;
}

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");
    try {
        const response = await fetch("/ask-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        if (response.ok) {
            pElement.textContent = data.reply.trim();
        } else {
            pElement.textContent = "Lỗi: " + data.error;
        }
    } catch (error) {
        pElement.textContent = "Không thể kết nối Server!";
    }

    incomingChatDiv.querySelector(".typing-animation")?.remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    const html = `<div class="chat-content"><div class="chat-details"><img src="user.png"><p>${userText}</p></div></div>`;
    const outgoingChatDiv = createChatDiv(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    setTimeout(() => {
        const loadingHtml = `<div class="chat-content"><div class="chat-details"><img src="gemini.png"><div class="typing-animation"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
        const incomingChatDiv = createChatDiv(loadingHtml, "incoming");
        chatContainer.appendChild(incomingChatDiv);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        getChatResponse(incomingChatDiv);
    }, 500);
}

sendButton.addEventListener("click", handleOutgoingChat);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleOutgoingChat(); }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeButton.innerText = document.body.classList.contains("light") ? "🌙" : "☀️";
});

deleteButton.addEventListener("click", () => {
    if(confirm("Xóa toàn bộ chat?")) chatContainer.innerHTML = "";
});