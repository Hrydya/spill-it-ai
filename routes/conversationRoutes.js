import express from "express"
import { createConversation, getConversations, getConversation, sendMessage, getMessages, toggleSaveConversation,deleteConversation } from "../controllers/conversationController.js"

const router = express.Router()

router.post("/", createConversation)
router.get("/", getConversations)
router.get("/:conversationId", getConversation)
router.post("/:conversationId/messages", sendMessage)
router.get("/:conversationId/messages", getMessages)
router.patch("/:conversationId/save", toggleSaveConversation)
router.delete("/:conversationId", deleteConversation)

export default router
