import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import createChunks from "../utils/createChunks.js";
import getEmbedding from "../utils/embedding.js";

import fs from "fs";
import path from "path";

import Chunk from "../data/Chunk.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEmbeddingWithRetry(text, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await getEmbedding(text);

        } catch (error) {
            if (error.status !== 429) {
                throw error;
            }

            const waitTime = 40000;

            console.log(
                `⏳ Rate limit reached. Waiting ${waitTime / 1000}s...`
            );

            await sleep(waitTime);
        }
    }

    throw new Error("❌ Failed after multiple retries");
}

async function seed() {

    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("🟢 Database connected");

        const filePath = path.resolve("src/data/sampleChapter.json");

        const bible = JSON.parse(
            fs.readFileSync(filePath, "utf-8")
        );

        // 1️⃣ Create chunks
        const chunks = createChunks(bible, 500);

        console.log(`✂️ Generated ${chunks.length} chunks`);

        // 2️⃣ Generate embeddings + save
        for (let i = 0; i < chunks.length; i++) {

            const chunk = chunks[i];

            
            const exists = await Chunk.findOne({
                chunkId: chunk.chunkId
            });

            if (exists) {
                console.log(
                    `⚠️ Chunk ${chunk.chunkId} already exists. Skipping...`
                );
                continue;
            }
            console.log(
                `🧠 Embedding ${i + 1}/${chunks.length}`
            );
            
            const embedding = await getEmbeddingWithRetry(
                chunk.text
            );

            await Chunk.create({
                ...chunk,
                embedding
            });

            console.log(
                `✅ Saved ${i + 1}/${chunks.length}`
            );
        }

        console.log("🎉 All chunks uploaded successfully!");

        process.exit(0);

    } catch (error) {

        console.error("❌ Seed failed:", error);

        process.exit(1);
    }
}

await seed();