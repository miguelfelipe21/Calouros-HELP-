const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const themeBtn = document.getElementById("themeBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");

let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChat = 0;

function renderChats() {
  chatList.innerHTML = "";
  chats.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = `Chat ${i + 1}`;
    li.onclick = () => switchChat(i);
    if (i === currentChat) li.style.background = "#2a2a2a";
    chatList.appendChild(li);
  });
}

function renderMessages() {
  chatEl.innerHTML = "";
  chats[currentChat].forEach(msg => {
    addMessage(msg.role, msg.content, false);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

function addMessage(role, text, save = true) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;

  if (save) {
    chats[currentChat].push({ role, content: text });
    localStorage.setItem("chats", JSON.stringify(chats));
  }
}

function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage("user", text);
  inputEl.value = "";

  setTimeout(() => {
    const reply = mockAIResponse(text);
    addMessage("assistant", reply);
  }, 1200);
}

function mockAIResponse(msg) {
  /*const replies = [
    "Interessante, fale mais sobre isso.",
    "Certo! Quer que eu explique em detalhes?",
    "Boa pergunta! Acho que posso ajudar.",
    "Entendi. Vamos explorar isso melhor."
  ];
  return replies[Math.floor(Math.random() * replies.length)];*/
  


        //const axios = require("axios");

const config = {
  headers: {
    "x-api-key": "sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM",
    "Content-Type": "application/json",
  },
};

const data = {
  sourceId: "src_QfPWzMsoCQigRNepgI7iQ",
  messages: [
    {
      role: "user",
      content: msg,
    },
  ],
};

axios
  .post("https://api.chatpdf.com/v1/chats/message", data, config)
  .then((response) => {
    //alert(response.data.content);
    addMessage("assistant", response.data.content);
  })
  .catch((error) => {
    console.error("Error:", error.message);
    console.log("Response:", error.response.data);
  });

}

function switchChat(i) {
  currentChat = i;
  renderChats();
  renderMessages();
}

newChatBtn.addEventListener("click", () => {
  chats.push([]);
  currentChat = chats.length - 1;
  renderChats();
  renderMessages();
  localStorage.setItem("chats", JSON.stringify(chats));
});

sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// Inicializa
if (chats.length === 0) chats.push([]);
renderChats();
renderMessages();