import express from "express"
import dotenv from "dotenv"
import chatRoutes from "./routes/chatRoutes.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.use("/api/chat", chatRoutes)

app.listen(process.env.PORT, () => {
    console.log(`server running on http://localhost:${process.env.PORT}`)
})