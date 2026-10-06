import "dotenv/config"
import app from "./src/app.js";

import { startMcpServer } from "./src/mcp/server.js";
import  dbConnect  from "./src/config/dbConnect.js";



const port = process.env.PORT || 3000;
const startServer = async()=>{
    try{
        await dbConnect();

        await startMcpServer();

        app.listen(port, () => console.log(`Server running on port ${port}`));
    }catch(err){
        console.error(err);
    }
}

startServer();