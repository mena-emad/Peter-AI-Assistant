import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        ref: "User"
    },
    messages:{
        type: Array,
        default: [],
        ref: "ChatHistory"
    },
    title:{
        type: String,
        required: true,
    },
    summary:{
        type: String,
        
    },
    summaryUpToMessage:{
        type: Number,
        default: 0
    },

},{
    timestamps:true,
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation