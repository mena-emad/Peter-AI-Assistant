import mongoose from "mongoose"
const dbConnect = async()=>{
    if(mongoose.connection.readyState === 1) return;

    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}

export default dbConnect

