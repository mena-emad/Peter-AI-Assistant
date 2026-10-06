import AppError from '../../utils/AppError.js'

class chatController{
    constructor(chatService) {
        this.chatService = chatService;
    }

    async getConversations(req,res){
        const conversations = await this.chatService.getConversations(req.user.userId)
        return res.status(200).json(conversations)
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
        if(!userId) throw new AppError('Not authorized',401)
        const result = await this.chatService.getCurrentChat(conversationId,userId);
        res.status(200).json(result);
    }

    async selectCurrentChat(req,res){
        const conversationId = req.body.conversationId
        if (!conversationId) throw new AppError('Conversation is required',400)
        const isOwned = await this.chatService.ownsConversation(conversationId,req.user.userId)
        if (!isOwned) throw new AppError('Conversation not found',404)
        const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
        res.cookie("conversationId",conversationId,{httpOnly:true,secure:process.env.NODE_ENV==="production" || sameSite === 'none',sameSite,path:"/"})
        return res.status(204).end()
    }
}

export default chatController