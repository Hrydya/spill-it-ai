const starter = document.getElementById("starter");
function starterfunc() {
    let startersarray = ["What's a secret you'd share with a stranger?", "Got a random brainwave or drama to spill?", "Say it like your phone's on airplane mode.", "Your Notes app deserves a break. Type it here instead.", "What's spinning in your mind?", "Drop the thought that made you go 'wait, what?'", "What's the dumbest thought you gave too much airtime today?", "You ever delete a message before even typing it? Yeah, that one.", "If your thoughts were tabs, which one's been open too long?", "Overshare like it's 2AM and no one will remember"];
    let maxi = startersarray.length;
    let x = Math.floor(Math.random() * (maxi));
    starter.textContent = startersarray[x];
}
document.addEventListener("DOMContentLoaded", starterfunc);
let chatHistory = [
    {
        role: "system",
        content: "You are a calm, non-judgmental space for people to vent. Your job is to listen first, not fix. Always: 1) Acknowledge what they're feeling in 1 sentence. 2) Reflect it back or ask one gentle follow-up. 3) Only suggest something if they ask. Keep it casual, short, like a friend texting at 2AM. No therapy speak. No toxic positivity. No 'I understand how you feel'. Emojis only if the vibe calls for it."    }
];
async function sendMsg() {
    const input = document.getElementById("msginput");
    const msg = input.value.trim();
    if (msg == "") return;
    input.value = "";

    const chatcontainer = document.getElementById("chat");
    chatcontainer.classList.remove("chatcontainer");
    chatcontainer.classList.add("newchatcontainer");
    starter.textContent = "";

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
        chatHistory.push({ role: "user", content: msg });

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages: chatHistory })
        });
        

        const data = await response.json().catch(() => ({}));

        // OpenAI-like responses have: { choices: [{ message: { content } }] }
        const aiReply = data?.choices?.[0]?.message?.content?.trim();

        // If the API responded with an error (or an unexpected shape), surface it.
        if (!aiReply) {
            const errMsg =
                data?.error?.message ||
                data?.error ||
                data?.details?.error?.message ||
                "Empty response from AI";
            throw new Error(errMsg);
        }

        // Adding AI's reply to history
        chatHistory.push({ role: "assistant", content: aiReply });
        aibubble.textContent = "";
        let i = 0;
        let timer = setInterval(() => {
            aibubble.textContent += aiReply[i];
            i++;
            if (i >= aiReply.length) clearInterval(timer);
        }, 20);

    } catch (err) {
        // Show a helpful message when the backend reports an API error (e.g. missing API key).
        aibubble.textContent = err?.message || "Sorry, I can't talk about that right now.";
        chatHistory = [{
            role: "system",
            content: " You are a friendly chatbot.Let the user vent and express themselves.Reply in a casual, concise, and natural way, like a friend texting.Avoid being formal or overly positive.short-medium answers"
        }];
        console.error(err);

    }

    input.value = "";
}

document.getElementById("msginput").addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
    }
});
