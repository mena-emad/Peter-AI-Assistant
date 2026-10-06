import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    googleId:{
        index:true,
        required:true,
        type:String,
        unique:true
    },name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },


},{
    timestamps:true,
    versionKey:false
})

const User = mongoose.model('User', userSchema);
export default User