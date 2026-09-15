import Conversation from "../model/Conversation.js"
import Message from "../model/Message.js"
export const createConversation = async (req, res, next) => {
    try {
        console.log("CREATE CONVERSATION CALLED")

        const conversation = await Conversation.create({
            sessionId: req.sessionId
        })

        console.log("NEW ID:", conversation._id)

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

export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params
        const { role, content } = req.body

        const conversation = await Conversation.findOne({
            _id: conversationId,
            sessionId: req.sessionId
        })

        if (!conversation) {
            return res.status(404).json({
                error: "Conversation not found"
            })
        }

        const message = await Message.create({
            conversationId,
            role,
            content
        })

        await Conversation.findByIdAndUpdate(conversationId, {
            updatedAt: new Date()
        })

        res.status(201).json({
            message
        })
    } catch (error) {
        next(error)
    }
}
export const getMessages = async (req, res, next) => {
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

        const messages = await Message.find({
            conversationId
        }).sort({ createdAt: 1 })

        res.json({
            messages
        })
    } catch (error) {
        next(error)
    }
}
export const toggleSaveConversation = async (req, res, next) => {
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

        conversation.saved = !conversation.saved

        await conversation.save()

        res.json({
            conversation
        })
    } catch (error) {
        next(error)
    }
}
export const deleteConversation = async (req, res, next) => {
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

        await Message.deleteMany({
            conversationId
        })

        await Conversation.deleteOne({
            _id: conversationId
        })

        res.json({
            message: "Conversation deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}