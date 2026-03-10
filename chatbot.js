const chatHistory = [
  {
    role: "system",
    content: `Eres la Profe Marce, una profesora de estadística con un estilo cercano y didáctico. 
Adapta tu tono según el contexto:
- Para consultas técnicas: sé clara y precisa.
- Para dudas generales: usa ejemplos cotidianos.
- Si el usuario menciona una imagen: "Contame qué ves en la imagen y te ayudo a interpretarlo".
Prioriza responder directamente a la pregunta del usuario. Solo preséntate si el mensaje inicial es un saludo genérico (ej: "hola").`
  }
];

function toggleChat() {
  const chatWindow = document.getElementById("chat-window");
  const profe = document.getElementById("profe-marce-avatar");
  const flecha = document.getElementById("chat-arrow");
  chatWindow.classList.toggle("hidden");

  if (!chatWindow.classList.contains("hidden")) {
    profe.style.display = "none";
    flecha.style.display = "none";
  } else {
    profe.style.display = "flex";
    flecha.style.display = "block";
  }
}


document.getElementById("chat-form").addEventListener("submit", async function (event) {
  event.preventDefault(); 

  const input = document.getElementById("chat-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendChatMessage("Usuario", userMessage);
  input.value = "";

  try {
    showTypingMessage();
    const botReply = await sendMessageToDeepSeek(userMessage);
    removeTypingMessage();
    appendChatMessage("Profe Marce", botReply);
  } catch (error) {
    removeTypingMessage();
    appendChatMessage("Profe Marce", "❌ Ocurrió un error. Intentalo de nuevo.");
    console.error(error);
  }
});


function fixLatex(content) {
  
  content = content.replace(/\\\[(.*?)\\\]/gs, (_, expr) => `$$${expr}$$`);

  
  content = content.replace(/\\\((.*?)\\\)/gs, (_, expr) => `$${expr}$`);

  return content;
}

function appendChatMessage(sender, message) {
  const chatBox = document.getElementById("chat-messages");
  const messageEl = document.createElement("div");

  
  const fixedMessage = fixLatex(message);

  messageEl.innerHTML = `<strong>${sender}:</strong><br>${marked.parse(fixedMessage)}`;
  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([messageEl]).catch((err) =>
      console.error("MathJax error:", err)
    );
  }
}

async function sendMessageToDeepSeek(userInput) {
  try {
  
    chatHistory.push({ role: "user", content: userInput });

    const response = await fetch("https://us-central1-estadisticamente-mate.cloudfunctions.net/profeMarceChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })

    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    chatHistory.push({ role: "assistant", content: data.reply });
    return data.reply; 

  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return "❌ Hubo un error al comunicarme con el servidor. Intenta de nuevo más tarde.";
  } finally {
    removeTypingMessage();
  }
}


function showTypingMessage() {
  const chatBox = document.getElementById("chat-messages");
  const typingEl = document.createElement("div");
  typingEl.id = "typing-message";
  typingEl.classList.add("typing-animation");
  typingEl.innerHTML = `<strong>Profe Marce:</strong> <span class="dot-typing"></span>`;
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingMessage() {
  const typingEl = document.getElementById("typing-message");
  if (typingEl) {
    typingEl.remove();
  }
}

document.getElementById("close-chat").addEventListener("click", (e) => {
  e.preventDefault();
  const chatWindow = document.getElementById("chat-window");
  const profe = document.getElementById("profe-marce-avatar");
  const flecha = document.getElementById("chat-arrow");
  
  chatWindow.classList.add("hidden");
  profe.style.display = "flex";
  flecha.style.display = "block";
});

window.toggleChat = toggleChat;
window.appendChatMessage = appendChatMessage;
window.sendMessageToDeepSeek = sendMessageToDeepSeek;
window.showTypingMessage = showTypingMessage;
window.removeTypingMessage = removeTypingMessage;
window.fixLatex = fixLatex;