import { Router } from "express";
import catchAsync from "../../utils/catchAsync.js";

class ChatRoutes{
    constructor(chatController,protect){
        this.router = Router()
        this.chatController = chatController
        this.protect = protect
        this.initRoutes()
    }

    initRoutes(){
        this.router.post('/chat',this.protect,catchAsync(this.chatController.sendMessage.bind(this.chatController)))
        this.router.get('/chats',this.protect,catchAsync(this.chatController.getCurrentChat.bind(this.chatController)))
        this.router.post('/chats/active',this.protect,catchAsync(this.chatController.selectCurrentChat.bind(this.chatController)))
    }

    getRouter(){
        return this.router
    }
}

export default ChatRoutes