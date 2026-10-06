import {zodToJsonSchema} from "zod-to-json-schema"

export default function mapToolsToGemini(tools){
    const functionDeclarations = tools.map((tool)=>{
        // console.log("Json Schema")
        // console.dir(tool,{depth:null,colors:true})
        // const jsonSchema = zodToJsonSchema(tool.config.inputSchema);
        // console.log("================")
        // console.dir(jsonSchema,{depth:null,colors:true})
        // return {
        //     name:tool.name,
        //     description:tool.config.description,
        //     parameters:{
        //         type:"OBJECT",
        //         properties:jsonSchema.properties??{},
        //         required:jsonSchema.required ?? []
        //     }
        // }
        if(tool.name==="search-verse-by-keyword"){
            return {
                name:tool.name,
                description:tool.config.description,
                parameters:{
                    type:"OBJECT",
                    properties:{
                        keyword:{type:"STRING"}
                    },
                    required:["keyword"]
                }
            }
        } if(tool.name === "search_bible_rag"){
            return {
                name:tool.name,
                description:tool.config.description,
                parameters:{
                    type:"OBJECT",
                    properties:{
                        keyword:{type:"STRING"},
                        bookFilter:{type:"STRING"}
                    },
                    required:["keyword"]
                }
            }
        }
    })
    return [{functionDeclarations}]
}