function init() {
  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  injectHTML(iconUrl);
  addEventListeners();
}

function injectHTML(iconUrl) {
  const chatIconHTML = `
    <div id="chat-icon" class="chat-icon" style="background-image: url('${iconUrl}')"></div>
    <div id="chat-window" class="chat-window">
      <div id="chat-header" class="chat-header">
        <span>Conversational Search</span>
        <button id="clear-chat" class="clear-chat">Clear</button>
      </div>
      <div id="chat-messages" class="chat-messages"></div>
      <div id="loading" class="loading">
        <p id="loading-text"></p>
        <div class="loading-bar">
          <div class="loading-bar-progress"></div>
        </div>
      </div>
      <input type="text" id="chat-input" class="chat-input" placeholder="Type your query...">
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", chatIconHTML);
}

function addEventListeners() {
  document
    .getElementById("chat-icon")
    .addEventListener("click", toggleChatWindow);
  document
    .getElementById("chat-input")
    .addEventListener("keypress", handleUserInput);
  document
    .getElementById("clear-chat")
    .addEventListener("click", clearChatMessages);
}

function toggleChatWindow() {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.classList.toggle("show");
  if (chatWindow.classList.contains("show")) {
    loadMessages();
  }
}

function handleUserInput(event) {
  if (event.key === "Enter") {
    const userMessage = event.target.value.trim();
    if (userMessage !== "") {
      displayMessage("user", userMessage);
      event.target.value = "";
      saveMessages();
      showLoadingAnimation("Searching for products...");
      fetchSuggestions(userMessage);
    }
  }
}

function fetchSuggestions(userMessage) {
  const yourServerUrl = `http://localhost:5173/api/anaconda/enhance-quick?q=${encodeURIComponent(
    userMessage
  )}`;

  fetch(yourServerUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Request failed");
      }
      return response.json();
    })
    .then((data) => {
      console.log("🚀 ~ .then ~ response.json():", data);
      hideLoadingAnimation();
      processSuggestions(data);
    })
    .catch((error) => {
      hideLoadingAnimation();
      handleFetchError(error, userMessage);
    });
}

function processSuggestions(data) {
  if (data && data.results && data.results.length > 0) {
    const carouselHtml = generateCarouselHTML(data.results);
    displayMessage("bot", carouselHtml);
    initAllCarousels();
    saveMessages();
  } else {
    displayMessage("bot", "No product suggestions found.");
  }
}

function handleFetchError(error, userMessage) {
  console.error("Error:", error);
  const apiUrl = `https://suggest.dxpapi.com/api/v2/suggest/?account_id=7049&auth_key=22ka3bny3tnfgolo&q=${encodeURIComponent(
    userMessage
  )}&catalog_views=anacondastores%7Ccontent_en_anaconda_au`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      hideLoadingAnimation();
      processSuggestions(data);
    })
    .catch((error) => {
      hideLoadingAnimation();
      console.error("Error:", error);
      displayMessage("bot", "Oops! Something went wrong.");
    });
}

function generateCarouselHTML(results) {
  return `
    <div class="product-carousel">
      <div class="carousel-container">
        ${results
          .map(
            (result) => `
          <div class="product-suggestion">
            <a href="${result.url}" target="_blank">
              <img src="${result.image}" alt="${result.title}" />
            </a>
            <div class="product-details">
              <a href="${result.url}" target="_blank">${result.title}</a>
              <p>Price: ${result.price}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <button class="prev-btn">&lt;</button>
      <button class="next-btn">&gt;</button>
    </div>
  `;
}

function initAllCarousels() {
  const carousels = document.querySelectorAll(".product-carousel");
  carousels.forEach((carousel) => {
    const container = carousel.querySelector(".carousel-container");
    const prevBtn = carousel.querySelector(".prev-btn");
    const nextBtn = carousel.querySelector(".next-btn");
    const suggestions = container.querySelectorAll(".product-suggestion");

    let currentIndex = 0;

    function showSuggestion(index) {
      container.style.transform = `translateX(-${index * 100}%)`;
    }

    prevBtn.addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + suggestions.length) % suggestions.length;
      showSuggestion(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % suggestions.length;
      showSuggestion(currentIndex);
    });
  });
}

function displayMessage(sender, message) {
  const chatMessages = document.getElementById("chat-messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);

  const senderLabel = document.createElement("span");
  senderLabel.classList.add("sender-label");
  senderLabel.textContent = sender === "user" ? "User:" : "Denbot 9000:";
  messageElement.appendChild(senderLabel);

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  if (sender === "bot" && message.includes('<div class="product-carousel">')) {
    messageContent.innerHTML = message;
  } else {
    messageContent.textContent = message;
  }

  messageElement.appendChild(messageContent);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Reinitialize carousels after adding new messages
  initAllCarousels();
}

function showLoadingAnimation(message) {
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loading-text");
  loadingText.textContent = message;
  loading.style.display = "block";
}

function hideLoadingAnimation() {
  const loading = document.getElementById("loading");
  loading.style.display = "none";
}

function clearChatMessages() {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";
  chrome.storage.local.remove("messages");
}

function saveMessages() {
  const chatMessages = document.getElementById("chat-messages");
  const messages = Array.from(chatMessages.children).map((messageElement) => ({
    sender: messageElement.classList.contains("user") ? "user" : "bot",
    message: messageElement
      .querySelector(".message-content")
      .innerHTML.replace(/^(User:|Denbot 9000:)/, "")
      .trim(),
  }));
  chrome.storage.local.set({ messages });
}

function loadMessages() {
  chrome.storage.local.get("messages", function (data) {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";
    if (data.messages) {
      data.messages.forEach(({ sender, message }) => {
        displayMessage(sender, message);
      });
    }
  });
}

init();
