import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getEmbedding(text) {
    const response = await ai.getGenerativeModel({model:"gemini-embedding-001"}).embedContent(text);
    return response.embedding.values
}

export default getEmbedding