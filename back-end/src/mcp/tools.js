import versesService from "../../container.js";
import getEmbedding from "../utils/embedding.js";
import Chunk from "../data/Chunk.js";
import {z} from "zod"
const tools = [
    {
        name:"search-verse-by-keyword",
        config:{
            title:"البحث في الأيات بواسطة كلمة البحث",
            description:"البحث عن الآيات في الكتاب المقدس باستخدام كلمة مفتاحية",
            inputSchema:z.object({
                keyword:z.string().describe("كلمة البحث"),
            })
        },
        cb:async({keyword})=>{
            try{

                const result = await versesService.searchByKeyword(keyword);
                return {
                    content:[
                        {
                            type:"text",
                            text:result.length>0?JSON.stringify(result):"لا يوجد نتايج"
                        }
                    ]
                }
            }catch(err){
                return {
                    isError:true,
                    content:[
                        {
                            type:"text",
                            text:err.message
                        }
                    ]
                }
            }
        }
    },
    {
        name:"search_bible_rag",
        config:{
            title:"البحث ف الايات عن طريق الارجاع",
            description:"البحث عن الآيات في الكتاب المقدس باستخدام الارجاع",
            inputSchema:z.object({
                keyword:z.string().describe("كلمة البحث"),
                bookFilter:z.string().describe("اسم الكتاب المراد البحث فيه").optional()
            })
        },
        cb:async({keyword , bookFilter})=>{
            const queryVector = await getEmbedding(keyword);

            const pipeline = [
                {
                    $vectorSearch:{
                        index:"vector-index",
                        path:"embedding",
                        queryVector:queryVector,
                        numCandidates:100,
                        limit:3
                    }
                }
            ]

            if(bookFilter){
                pipeline[0].$vectorSearch.filter = {
                    book : {
                        $eq : bookFilter
                    }
                }
            }

            const results = await Chunk.aggregate(pipeline);

            const formattedResults = results.map(r => 
            `[${r.book} ${r.chapter}:${r.verseNumber.join('-')}]\n${r.text}`
            ).join("\n\n---\n\n");

            return {
                content:[
                    {
                        type:"text",
                        text:formattedResults?formattedResults:"لا يوجد نتايج"
                    }
                ]
            }
        }
    }
]

export default tools