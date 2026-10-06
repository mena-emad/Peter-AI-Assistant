import mongoose from "mongoose"

const ChatHistorySchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        ref: "User",
        index:true
    },
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true,
        index:true
    },
    role:{
        type:String,
        required:true,
        enum:["user","model"]
    },

    content:{
        type:String,
        required:true
    }
    
},{
    timestamps:true
})

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);
export default ChatHistory