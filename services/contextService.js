import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"

export const getConversationContext = async (conversationId, sessionId) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        sessionId
    })

    if (!conversation) {
        throw new Error("Conversation not found")
    }

    const query = {
        conversationId
    }

    if (conversation.lastSummarizedMessageId) {
        const lastSummarizedMessage = await Message.findById(
            conversation.lastSummarizedMessageId
        )

        if (lastSummarizedMessage) {
            query.createdAt = {
                $gt: lastSummarizedMessage.createdAt
            }
        }
    }

    const messages = await Message.find(query)
        .sort({ createdAt: 1 })

    return {
        summary: conversation.summary,
        messages
    }
}
export const generateSummary = async (existingSummary, messages) => {
    const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n")

    const prompt = `
Summarize this conversation for future context.
Keep important facts, feelings, preferences, decisions, goals, and unresolved topics.
Return ONLY the summary. Do not reply to the user.

${existingSummary ? `Previous summary: ${existingSummary}\n` : ""}

Conversation:
${conversationText}
`

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            body: JSON.stringify({
                model: "gemini-2.5-flash",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            `Summary API request failed with status ${response.status}`
        )
    }

    const summary = data?.choices?.[0]?.message?.content?.trim()

    if (!summary) {
        throw new Error("Empty summary response")
    }

    return summary
}

export const shouldSummarize = (messages) => {
    return messages.length >= 12
}