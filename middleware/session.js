import mongoose from "mongoose"
import Session from "../model/Session.js"

const sessionMiddleware = async (req, res, next) => {
    try {
        let session = null
        const cookieSessionId = req.cookies.sessionId

        if (
            cookieSessionId &&
            mongoose.isValidObjectId(cookieSessionId)
        ) {
            session = await Session.findById(cookieSessionId)
        }

        if (!session) {
            session = await Session.create({})

            res.cookie("sessionId", session._id.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            })
        }

        req.sessionId = session._id

        await Session.findByIdAndUpdate(session._id, {
            lastActivityAt: new Date()
        })

        next()
    } catch (error) {
        console.error("SESSION ERROR:", error)
        next(error)
    }
}

export default sessionMiddleware