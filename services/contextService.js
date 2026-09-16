import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"

export const getConversationContext = async (conversationId) => {
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
        throw new Error("Conversation not found")
    }

    const messages = await Message.find({
        conversationId
    })
        .sort({ createdAt: -1 })
        .limit(5)

    messages.reverse()

    return {
        summary: conversation.summary,
        messages
    }
}