import Session from "../model/Session.js"
import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"

const SESSION_EXPIRY_DAYS = 7

export const cleanupExpiredSessions = async () => {
    try {
        const expiryDate = new Date(
            Date.now() - SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        )

        const expiredSessions = await Session.find({
            lastActivityAt: { $lt: expiryDate }
        })

        for (const session of expiredSessions) {
            const conversations = await Conversation.find({
                sessionId: session._id
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
                sessionId: session._id
            })

            if (remainingConversations === 0) {
                await Session.deleteOne({
                    _id: session._id
                })
            }
        }

        console.log(
            `Session cleanup completed. Removed ${expiredSessions.length} expired sessions.`
        )
    } catch (error) {
        console.error("SESSION CLEANUP ERROR:", error)
    }
}