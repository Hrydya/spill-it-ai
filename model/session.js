import mongoose from 'mongoose'
const sessionSchema= new mongoose.Schema(
    
    {
        lastActivityAt:{
        type:Date,
        default:Date.now
        }
    },
    {
        timestamps:true
    }
)

const Session = mongoose.model("Session",sessionSchema)
export default Session