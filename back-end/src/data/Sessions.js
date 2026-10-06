import mongoose from "mongoose";

const SessionsSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        ref: "User",
        unique: true,
        index: true
    },

    refreshTokenHash:{
        type: String,
        required: true,
        unique: true
    },
    expiresAt:{
        type: Date,
        required: true
    },



},{
    timestamps:true,
});

const Sessions = mongoose.model('Sessions', SessionsSchema);
export default Sessions