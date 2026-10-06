class ChatService{
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    async createConversation(userId) {
        return this.chatRepository.createConversation(userId);
    }

    async getConversations(userId) {
        return this.chatRepository.getConversations(userId);
    }

    async sendMessage(message,conversationId,userId) {
       
        let {content:result,conversationId:activeConversationId} = await this.chatRepository.sendMessage(message,conversationId,userId);
        if(Array.isArray(result) && result.length > 0) {
            return result.join('\n')
        }
        if(result ) return {result,conversationId:activeConversationId};

    }

    async getCurrentChat(conversationId,userId) {
        return this.chatRepository.getCurrentChat(conversationId,userId);
    }

    async ownsConversation(conversationId,userId) {
        return this.chatRepository.ownsConversation(conversationId,userId);
    }
}

export default ChatService