import {
    getConversationContext,
    generateSummary,
    shouldSummarize
} from "../services/contextService.js"
import Message from "../model/Message.js"
import Conversation from "../model/Conversation.js"
import mongoose from "mongoose"



export const handleChat = async (req, res, next) => {
    try {
        const { conversationId, message } = req.body

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                error: "Invalid conversation ID"
            })
        }

        if (typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({
                error: "Message is required"
            })
        }

        if (message.length > 10000) {
            return res.status(400).json({
                error: "Message is too long"
            })
        }

        const context = await getConversationContext(
            conversationId,
            req.sessionId
        )

        await Message.create({
            conversationId,
            role: "user",
            content: message
        })

        const messages = [
            {
                role: "system",
                content: "You are a calm, non-judgmental space for people to vent. Your job is to listen first, not fix. Always: 1) Acknowledge what they're feeling in 1 sentence. 2) Reflect it back or ask one gentle follow-up. 3) Only suggest something if they ask. Keep it casual, short, like a friend texting at 2AM. No therapy speak. No toxic positivity. No 'I understand how you feel'. Emojis only if the vibe calls for them."
            }
        ]

        if (context.summary) {
            messages.push({
                role: "system",
                content: `This is background context from earlier in the conversation.Use it only to answer the user's latest message. Do not respond to or summarize this context.

                Conversation summary:${context.summary} `
            })
        }

        messages.push(
            ...context.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        )

        messages.push({
            role: "user",
            content: message
        })

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.TOGETHER_API_KEY} `
            },
            body: JSON.stringify({
                model: "gemini-2.5-flash",
                messages,
                stream: true
            })
        })

        

        if (!response.ok) {

            const data = await response.json().catch(() => ({}))

            const errMessage =
                data?.error?.message ||
                data?.error?.detail ||
                data?.message ||
                `API request failed with status ${response.status} `

            return res.status(response.status).json({
                error: errMessage,
                details: data
            })
        }

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders()

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ""
        let aiReply = ""

        while (true) {
            const { value, done } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split("\n")
            buffer = lines.pop()

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue

                const data = line.slice(6)

                if (data === "[DONE]") continue

                const parsed = JSON.parse(data)
                const chunk = parsed?.choices?.[0]?.delta?.content || ""

                if (!chunk) continue

                aiReply += chunk

                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            }
        }

        if (aiReply) {
            await Message.create({
                conversationId,
                role: "assistant",
                content: aiReply
            })

            const updatedContext = await getConversationContext(
                conversationId,
                req.sessionId
            )

            if (shouldSummarize(updatedContext.messages)) {
                const newSummary = await generateSummary(
                    updatedContext.summary,
                    updatedContext.messages
                )

                await Conversation.findByIdAndUpdate(conversationId, {
                    summary: newSummary,
                    lastSummarizedMessageId: updatedContext.messages[
                        updatedContext.messages.length - 1
                    ]._id
                })
            }
        }

        res.end()
    } catch (error) {
        next(error)
    }
}
