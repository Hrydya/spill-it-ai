import Conversation from "../model/Conversation.js"

export const createConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.create({
            sessionId: req.sessionId
        })

        res.status(201).json({
            conversation
        })
    } catch (error) {
        next(error)
    }
}
export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            sessionId: req.sessionId
        }).sort({ updatedAt: -1 })

        res.json({
            conversations
        })
    } catch (error) {
        next(error)
    }
}
export const getConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params

        const conversation = await Conversation.findOne({
            _id: conversationId,
            sessionId: req.sessionId
        })

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found"
            })
        }

        res.json({
            conversation
        })
    } catch (error) {
        next(error)
    }
}