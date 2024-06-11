// Get the URL of the icon image file
const iconUrl = chrome.runtime.getURL("icons/icon48.png");

// Inject the icon and chat window HTML into the page
const chatIconHTML = `
<div id="chat-icon" class="chat-icon" style="background-image: url('${iconUrl}')"></div>
<div id="chat-window" class="chat-window">
  <div id="chat-header" class="chat-header">Conversational Search</div>
  <div id="chat-messages" class="chat-messages"></div>
  <input type="text" id="chat-input" class="chat-input" placeholder="Type your query...">
</div>
`;

document.body.insertAdjacentHTML("beforeend", chatIconHTML);

// Toggle chat window display on icon click
document.getElementById("chat-icon").addEventListener("click", function () {
  const chatWindow = document.getElementById("chat-window");
  chatWindow.classList.toggle("show");
});

// Handle user input and display response
document
  .getElementById("chat-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const userMessage = event.target.value.trim();

      if (userMessage !== "") {
        displayMessage("user", userMessage);
        displayMessage("bot", `I heard you say: "${userMessage}"`);
        event.target.value = "";
      }
    }
  });

// Display a message in the chat window
function displayMessage(sender, message) {
  const chatMessages = document.getElementById("chat-messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", sender);
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
