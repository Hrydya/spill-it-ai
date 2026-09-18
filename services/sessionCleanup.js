import Session from "../model/Session.js"
import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"

export const cleanupTemporaryConversations = async (sessionId) => {
    const conversations = await Conversation.find({
        sessionId
    })

    for (const conversation of conversations) {
        if (!conversation.saved) {
            await Message.deleteMany({
                conversationId: conversation._id
            })

            await Conversation.deleteOne({
                _id: conversation._id
            })
        }
    }

    const remainingConversations = await Conversation.countDocuments({
        sessionId
    })

    if (remainingConversations === 0) {
        await Session.deleteOne({
            _id: sessionId
        })
    }
}