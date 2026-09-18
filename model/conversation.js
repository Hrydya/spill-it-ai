import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "New conversation",
            maxlength: 100
        },

        saved: {
            type: Boolean,
            default: false
        },

        summary: {
            type: String,
            default: ""
        },
        lastSummarizedMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        }
    },
    {
        timestamps: true
    }
)

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
)

export default Conversation