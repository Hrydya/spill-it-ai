import express from "express"
import dotenv from "dotenv"
import chatRoutes from "./routes/chatRoutes.js"
import cookieParser from "cookie-parser"
import sessionMiddleware from "./middleware/session.js"
import connectDB from "./config/db.js"
import conversationRoutes from "./routes/conversationRoutes.js"
import { cleanupTemporaryConversations } from "./services/sessionCleanup.js"

dotenv.config()
const app = express()

app.use(express.json({limit:"100kb"}))
app.use(cookieParser());
app.use(express.static("public"))

app.use("/api", sessionMiddleware)
app.post("/api/session/end", async (req, res, next) => {
    try {
        await cleanupTemporaryConversations(req.sessionId)
        res.status(204).end()
    } catch (error) {
        next(error)
    }
})

app.use("/api/chat", chatRoutes)
app.use("/api/conversations", conversationRoutes)
app.use((err, req, res, next) => {
    console.error(err)

    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    })
})
const startServer = async()=>{
    await connectDB()
    
    app.listen(process.env.PORT, () => {
        console.log(`server running on http://localhost:${process.env.PORT}`)
    })
}
startServer();
