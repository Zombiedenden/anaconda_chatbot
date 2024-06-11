// Get the URL of the icon image file
const iconUrl = chrome.runtime.getURL("icons/icon48.png");

// Inject the icon and chat window HTML into the page
const chatIconHTML = `
<div id="chat-icon" class="chat-icon" style="background-image: url('${iconUrl}')"></div>
<div id="chat-window" class="chat-window">
  <div id="chat-header" class="chat-header">
    <span>Conversational Search</span>
    <button id="clear-chat" class="clear-chat">Clear</button>
  </div>
  <div id="chat-messages" class="chat-messages"></div>
  <input type="text" id="chat-input" class="chat-input" placeholder="Type your query...">
</div>
`;

document.body.insertAdjacentHTML("beforeend", chatIconHTML);

// Toggle chat window display on icon click
document.getElementById("chat-icon").addEventListener("click", function () {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.classList.toggle("show");
  if (chatWindow.classList.contains("show")) {
    loadMessages();
  }
});

// Handle user input and display response
document
  .getElementById("chat-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const userMessage = event.target.value.trim();

      if (userMessage !== "") {
        displayMessage("user", userMessage);
        event.target.value = "";
        saveMessages();

        // Send request to Dxpapi URL
        const apiUrl = `https://suggest.dxpapi.com/api/v2/suggest/?account_id=7049&auth_key=22ka3bny3tnfgolo&q=${encodeURIComponent(
          userMessage
        )}&catalog_views=anacondastores%7Ccontent_en_anaconda_au`;

        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => {
            const suggestionGroups = data.suggestionGroups;
            if (suggestionGroups.length > 0) {
              const searchSuggestions = suggestionGroups[0].searchSuggestions;
              if (searchSuggestions.length > 0) {
                const firstSuggestion = searchSuggestions[0];
                const productTitle = firstSuggestion.title;
                const productImageUrl = firstSuggestion.thumb_image;
                const productUrl = firstSuggestion.styleUrl;
                const productPrice = firstSuggestion.price;

                const productHtml = `
                <div class="product-suggestion">
                  <a href="${productUrl}" target="_blank">
                    <img src="${productImageUrl}" alt="${productTitle}" />
                  </a>
                  <div class="product-details">
                    <a href="${productUrl}" target="_blank">${productTitle}</a>
                    <p>Price: $${productPrice}</p>
                  </div>
                </div>
              `;

                displayMessage("bot", productHtml);
              } else {
                displayMessage("bot", "No product suggestions found.");
              }
            } else {
              displayMessage("bot", "No suggestions found.");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            displayMessage("bot", "Oops! Something went wrong.");
          });
      }
    }
  });

// Clear chat messages
document.getElementById("clear-chat").addEventListener("click", function () {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";
  chrome.storage.local.remove("messages");
});

// Display a message in the chat window
function displayMessage(sender, message) {
  const chatMessages = document.getElementById("chat-messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);

  if (
    sender === "bot" &&
    message.includes('<div class="product-suggestion">')
  ) {
    messageElement.innerHTML = message;
  } else {
    messageElement.textContent = message;
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Save messages to local storage
function saveMessages() {
  const chatMessages = document.getElementById("chat-messages");
  const messages = Array.from(chatMessages.children).map((messageElement) => ({
    sender: messageElement.classList.contains("user") ? "user" : "bot",
    message: messageElement.textContent,
  }));
  chrome.storage.local.set({ messages });
}

// Load messages from local storage
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
