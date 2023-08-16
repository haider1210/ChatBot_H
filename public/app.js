
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
let userText = null;

// Function to fetch the API key from the server
async function fetchApiKey() {
  try {
    const response = await fetch('/api-key');
    const data = await response.json();
    return String(data.apiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
}

// Usage
(async () => {
  try {
    const apikey=await fetchApiKey();
    
      const  API_KEY=String(apikey);
   
    const initialHeight = chatInput.scrollHeight;

    const loadDataFromlocalstorage = () => {
      const themeColor = localStorage.getItem("theme-color");
      document.body.classList.toggle("light-mode", themeColor === "light_mode");

      themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
      const defaultText = `<div class="default-text">
        <h1>Iqra_Bot</h1>
        <p>Start the conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
      </div>`;
      chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    };
    loadDataFromlocalstorage();

    const createElement = (html, className) => {
      const chatDiv = document.createElement("div");
      chatDiv.classList.add("chat", className);
      chatDiv.innerHTML = html;
      return chatDiv;
    };

    const getChatResponse = async (incomingChatDiv) => {
      const API_URL = "https://api.openai.com/v1/completions";
      const codeElement = document.createElement("div");

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: userText,
          max_tokens: 2048,
          temperature: 0.2
        })
      };

      try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        codeElement.innerText = data.choices[0].text.trim();
      } catch (error) {
        codeElement.classList.add("error");
        codeElement.innerText = "Oops! Something went wrong while retrieving the response. Please try again."
      }

      incomingChatDiv.querySelector(".typing-animation").remove();
      incomingChatDiv.querySelector(".chat-details").appendChild(codeElement);

      localStorage.setItem("all-chats", chatContainer.innerHTML);
    };

    const showTypingAnimation = () => {
      const html = `<div class="chat-content">
        <div class="chat-details">
          <img src="images/haidbot.png" alt="chatbot-image" height="60px">
          <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0s"></div>
            <div class="typing-dot" style="--delay: 0.1s"></div>
            <div class="typing-dot" style="--delay: 0.2s"></div>
          </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-outlined">
          content_copy
        </span>
      </div>`;
      const incomingChatDiv = createElement(html, "incoming");
      chatContainer.appendChild(incomingChatDiv);
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
      getChatResponse(incomingChatDiv);
    };

    const handleOutgoingChat = () => {
      userText = chatInput.value;
      if (!userText) return;

      const escapedText = userText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      chatInput.value = "";
      chatInput.style.height = `${initialHeight}px`;
      const html = `<div class="chat-content">
        <div class="chat-details">
          <img src="images/user.png" alt="error" height="60px">
          <p>${escapedText}</p>
        </div>
      </div>`;

      const outgoingChatDiv = createElement(html, "outgoing");
      outgoingChatDiv.querySelector("p").textContent = userText;
      document.querySelector(".default-text")?.remove();
      chatContainer.appendChild(outgoingChatDiv);

      setTimeout(showTypingAnimation, 500);
    };

    themeButton.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      localStorage.setItem("theme-color", themeButton.innerHTML);
      themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    });

    deleteButton.addEventListener("click", () => {
      if (confirm("Are you sure to delete all the chats? ")) {
        localStorage.removeItem("all-chats");
        loadDataFromlocalstorage();
      }
    });

    chatInput.addEventListener("input", () => {
      chatInput.style.height = `${initialHeight}px`;
      chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
      }
    });

    sendButton.addEventListener("click", handleOutgoingChat);

    document.getElementById('send-btn').addEventListener('click', function() {
      const scrollPosition = document.body.scrollHeight;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    });

    document.addEventListener('keydown', function(event) {
      if (event.keyCode === 13) {
        const scrollPosition = document.body.scrollHeight;
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
})();
