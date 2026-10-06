import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"
import tools from "./tools.js";
import versesService from "../../container.js";

export function createMcpServer(){
    const server = new McpServer({
        name:"bible-ai-mcp-server",
        version:"1.0.0",
    })

    tools.forEach((t)=>{
        server.registerTool(t.name,t.config,t.cb)
    })
    return server
    
}


export async function startMcpServer(){
    const server = createMcpServer();
    await server.connect(new StdioServerTransport());
    console.error("🚀 MCP Server running on stdio");
}