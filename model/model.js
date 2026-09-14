import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true,
            maxlength: 10000
        }
    },
    {
        timestamps: true
    }
)

const Message = mongoose.model("Message", messageSchema)

export default Message