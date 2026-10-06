class chatController{
    constructor(chatService) {
        this.chatService = chatService;
    }

    async sendMessage(req,res){
        const message = req.body.message;
        const requestedConversationId = req.body.newConversation ? null : req.cookies?.conversationId;
        const {result,conversationId} = await this.chatService.sendMessage(message,requestedConversationId,req.user.userId);
        const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
        res.cookie("conversationId",conversationId,{httpOnly:true,secure:process.env.NODE_ENV==="production" || sameSite === 'none',sameSite,path:"/"});
        res.status(200).json({result,conversationId});
    }

    async getCurrentChat(req,res){
        const userId = req.user?.userId;
        const conversationId = req.cookies?.conversationId;
        if (!conversationId) return res.status(200).json([]);
        if(!userId) return res.status(401).json({message:"Not authorized"});
        const result = await this.chatService.getCurrentChat(conversationId,userId);
        res.status(200).json(result);
    }

    async selectCurrentChat(req,res){
        const conversationId = req.body.conversationId
        if (!conversationId) return res.status(400).json({message:"Conversation is required"})
        try{
            const isOwned = await this.chatService.ownsConversation(conversationId,req.user.userId)
            if (!isOwned) return res.status(404).json({message:"Conversation not found"})
            const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
            res.cookie("conversationId",conversationId,{httpOnly:true,secure:process.env.NODE_ENV==="production" || sameSite === 'none',sameSite,path:"/"})
            return res.status(204).end()
        }catch{
            return res.status(404).json({message:"Conversation not found"})
        }
    }
}

export default chatController