import { Router } from "express";

class ChatRoutes{
    constructor(chatController,protect){
        this.router = Router()
        this.chatController = chatController
        this.protect = protect
        this.initRoutes()
    }

    initRoutes(){
        this.router.post('/chat',this.protect,this.chatController.sendMessage.bind(this.chatController))
        this.router.get('/chats',this.protect,this.chatController.getCurrentChat.bind(this.chatController))
        this.router.post('/chats/active',this.protect,this.chatController.selectCurrentChat.bind(this.chatController))
    }

    getRouter(){
        return this.router
    }
}

export default ChatRoutes