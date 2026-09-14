import express from "express"
import dotenv from "dotenv"
import chatRoutes from "./routes/chatRoutes.js"
import cookieParser from "cookie-parser"
import sessionMiddleware from "./middleware/session.js"
import connectDB from "./config/db.js"
import conversationRoutes from "./routes/conversationRoutes.js"

dotenv.config()
const app = express()

app.use(express.json({limit:"100kb"}))
app.use(cookieParser());
app.use(express.static("public"))

app.use("/api", sessionMiddleware)
app.use("/api/chat", chatRoutes)
app.use("/api/conversations", conversationRoutes)
const startServer = async()=>{
    await connectDB()
    app.listen(process.env.PORT, () => {
        console.log(`server running on http://localhost:${process.env.PORT}`)
    })
}
startServer();
