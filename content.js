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
