let currentUser = null;

function openChat(user) {
  currentUser = user;
  document.getElementById("chat-user").textContent = user;
  document.getElementById("message-input").disabled = false;
  document.getElementById("send-btn").disabled = false;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // reset chat
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const messageText = input.value.trim();
  if (!messageText || !currentUser) return;

  const chatBox = document.getElementById("chat-box");

  // Sent message
  const message = document.createElement("div");
  message.classList.add("message", "sent");
  message.textContent = messageText;
  chatBox.appendChild(message);

  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = "";

  // Simulated reply
  setTimeout(() => {
    const reply = document.createElement("div");
    reply.classList.add("message", "received");
    reply.textContent = currentUser + " replied!";
    chatBox.appendChild(reply);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}
