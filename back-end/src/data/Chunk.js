import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema({
    chunkId:{
        type: String,
        required: true,
        unique: true
    },
    book:{
        type: String,
        required: true
    },
    chapter:{
        type: Number,
        required: true
    },
    verseNumber:{
        type: [Number],
        required: true
    },
    text:{
        type: String,
        required: true
    },
    embedding:{
        type:[Number],
    }
});

const Chunk = mongoose.model('Chunk', ChunkSchema);
export default Chunk