// Inject chat window HTML into the page
const chatWindowHTML = `
<div id="chat-window">
  <div id="chat-header">Conversational Search</div>
  <div id="chat-messages"></div>
  <input type="text" id="chat-input" placeholder="Type your query...">
</div>`;

document.body.insertAdjacentHTML("beforeend", chatWindowHTML);

// Add event listener to search input field
document
  .querySelector('input[type="search"]')
  .addEventListener("input", function (event) {
    const query = event.target.value;
    if (query.length > 2) {
      fetch("https://your-server.com/search", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          const chatMessages = document.getElementById("chat-messages");
          chatMessages.innerHTML = data.result;
        });
    }
  });
