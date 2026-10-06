class ChatApi{
    constructor(baseURL,api){
        this.api = api
        this.baseURL = baseURL.replace(/\/+$/, '')
    }

    async sendMessage(content,{newConversation = false} = {}){
        const message = typeof content === 'string' ? content.trim() : ''
        if(!message) throw new TypeError('اكتب رسالة قبل الإرسال.')

        const body = newConversation ? {message,newConversation:true} : {message}
        const {data} = await this.api.post(`${this.baseURL}/chat`,body)
        if(typeof data?.result !== 'string' || !data.conversationId) throw new TypeError('استجابة الخادم غير متوقعة.')
        return {content: data.result, conversationId: String(data.conversationId)}
    }

    async getCurrentChat(){
        const {data} = await this.api.get(`${this.baseURL}/chats`)
        if(!Array.isArray(data)) throw new TypeError('استجابة المحادثة غير متوقعة.')
        return data
    }

    async selectCurrentChat(conversationId){
        if (typeof conversationId !== 'string' || !conversationId.trim()) {
            throw new TypeError('معرّف المحادثة غير صالح.')
        }
        await this.api.post(`${this.baseURL}/chats/active`,{conversationId})
    }
}

export default ChatApi