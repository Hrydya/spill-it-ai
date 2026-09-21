const starter = document.getElementById("starter");
function starterfunc() {
    let startersarray = ["What's a secret you'd share with a stranger?", "Got a random brainwave or drama to spill?", "Say it like your phone's on airplane mode.", "Your Notes app deserves a break. Type it here instead.", "What's spinning in your mind?", "Drop the thought that made you go 'wait, what?'", "What's the dumbest thought you gave too much airtime today?", "You ever delete a message before even typing it? Yeah, that one.", "If your thoughts were tabs, which one's been open too long?", "Overshare like it's 2AM and no one will remember"];
    let maxi = startersarray.length;
    let x = Math.floor(Math.random() * (maxi));
    starter.textContent = startersarray[x];
}
document.addEventListener("DOMContentLoaded", starterfunc);

let conversationId = null;
let isSending = false;
const conversationList = document.getElementById("conversationList");
const newChatBtn = document.getElementById("newchatbtn");

async function loadConversations() {
    try {
        const response = await fetch("/api/conversations");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to load conversations");
        }

        conversationList.innerHTML = "";

        data.conversations.forEach(conversation => {
            const item = document.createElement("div");
            item.className = "conversation-item";

            const title = document.createElement("span");
            title.textContent = conversation.title;

            const saveBtn = document.createElement("button");
            saveBtn.className = "save-btn";
            saveBtn.textContent = conversation.saved ? "★" : "☆";
            saveBtn.title = conversation.saved ? "Unsave" : "Save";

            saveBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await toggleSave(conversation._id, saveBtn);
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "×";
            deleteBtn.title = "Delete";

            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await deleteConversation(conversation._id);
            });

            item.appendChild(title);
            item.appendChild(saveBtn);
            item.appendChild(deleteBtn);

            item.addEventListener("click", () => {
                openConversation(conversation._id);
            });

            conversationList.appendChild(item);
        });

    } catch (error) {
        console.error("Failed to load conversations:", error);
    }
}
async function toggleSave(id,saveBtn) {
    try {
        const response = await fetch(`/api/conversations/${id}/save`, {
            method: "PATCH"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to save conversation");
        }

        saveBtn.textContent = data.conversation.saved ? "★" : "☆";

    } catch (error) {
        console.error("Failed to toggle save:", error);
    }
}
async function deleteConversation(id) {
    try {
        const response = await fetch(`/api/conversations/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to delete conversation");
        }

        if (conversationId === id) {
            startNewConversation();
        }

        await loadConversations();

    } catch (error) {
        console.error("Failed to delete conversation:", error);
    }
}
async function openConversation(id) {
    try {
        const response = await fetch(`/api/conversations/${id}/messages`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to load conversation");
        }

        conversationId = id;

        const chat = document.getElementById("chat");
        chat.innerHTML = "";
        chat.classList.remove("chatcontainer");
        chat.classList.add("newchatcontainer");

        data.messages.forEach(message => {
            const bubble = document.createElement("div");

            bubble.className =
                message.role === "user"
                    ? "bubble user-bubble"
                    : "bubble ai-bubble";

            bubble.textContent = message.content;
            chat.appendChild(bubble);
        });

    } catch (error) {
        console.error("Failed to open conversation:", error);
    }
}
async function startNewConversation() {
    try {
        const response = await fetch("/api/conversations", {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to create conversation");
        }

        conversationId = data.conversation._id;

        const chat = document.getElementById("chat");

        chat.innerHTML = `<div class="message" id="starter"></div>`;

        chat.classList.remove("newchatcontainer");
        chat.classList.add("chatcontainer");

        const newStarter = document.getElementById("starter");

        const startersarray = [
            "What's a secret you'd share with a stranger?",
            "Got a random brainwave or drama to spill?",
            "Say it like your phone's on airplane mode.",
            "What's spinning in your mind?"
        ];

        newStarter.textContent =
            startersarray[Math.floor(Math.random() * startersarray.length)];

        await loadConversations();

    } catch (error) {
        console.error("Failed to create conversation:", error);
    }
}
newChatBtn.addEventListener("click", startNewConversation);


setTimeout(loadConversations, 1000);

async function sendMsg() {
  

    if (isSending) return;

    const input = document.getElementById("msginput");
    const msg = input.value.trim();
    if (msg == "") return;

    isSending = true;
    document.getElementById("sendbtn").disabled = true;

    input.value = "";

    const chatcontainer = document.getElementById("chat");
    chatcontainer.classList.remove("chatcontainer");
    chatcontainer.classList.add("newchatcontainer");
    document.getElementById("starter").textContent = "";

    //userbubble
    const userbubble = document.createElement("div");
    userbubble.className = "bubble user-bubble";
    userbubble.textContent = msg;
    document.getElementById("chat").appendChild(userbubble);

    //aibubble
    const aibubble = document.createElement("div");
    aibubble.className = "bubble ai-bubble";
    aibubble.textContent = "Typing....";
    document.getElementById("chat").appendChild(aibubble);

    try {
        // Adding user's message to history

        if (!conversationId) {
            const conversationResponse = await fetch("/api/conversations", {
                method: "POST"
            });

            const conversationData = await conversationResponse.json();

            if (!conversationResponse.ok) {
                throw new Error(
                    conversationData?.error || "Failed to create conversation"
                );
            }

            conversationId = conversationData.conversation._id;
            await loadConversations();
        }
       

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                conversationId,
                message: msg
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            const errMsg =
                data?.error?.message ||
                data?.error ||
                data?.details?.error?.message ||
                "Failed to get AI response";

            throw new Error(errMsg);
        }

        aibubble.textContent = "";

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;

                const data = line.slice(6);

                if (data === "[DONE]") continue;

                const parsed = JSON.parse(data);
                const chunk = parsed?.content || "";

              
                aibubble.textContent += chunk;
            }
        }

    } catch (err) {
        aibubble.textContent =
            err?.message || "Sorry, I can't talk about that right now.";
        console.error(err);

    } finally {
        isSending = false;
        document.getElementById("sendbtn").disabled = false;
    }
}
document.getElementById("msginput").addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
    }
});
window.addEventListener("pagehide", () => {
    navigator.sendBeacon("/api/session/end");
});