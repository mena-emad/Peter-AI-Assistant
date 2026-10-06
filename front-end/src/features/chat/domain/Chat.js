export class ChatError extends Error {
  constructor(message, cause) {
    super(message, { cause })
    this.name = 'ChatError'
  }
}

class Chat {
  constructor(api) {
    this.api = api
  }

  async sendMessage(content, options) {
    const message = typeof content === 'string' ? content.trim() : ''
    if (!message) throw new ChatError('اكتب رسالة قبل الإرسال.')

    try {
      const response = await this.api.sendMessage(message, options)
      if (typeof response?.content !== 'string' || !response.conversationId) {
        throw new ChatError('تعذر قراءة إجابة المساعد. حاول مرة أخرى.')
      }
      return response
    } catch (error) {
      if (error instanceof ChatError) throw error
      throw new ChatError('تعذر إرسال رسالتك. تحقق من اتصالك ثم حاول مرة أخرى.', error)
    }
  }

  async getCurrentChat(requestedConversationId) {
    try {
      if (requestedConversationId) await this.api.selectCurrentChat(requestedConversationId)
      const records = await this.api.getCurrentChat()
      if (!Array.isArray(records)) throw new ChatError('تعذر قراءة المحادثة.')
      const conversationId = records[0]?.conversationId ? String(records[0].conversationId) : requestedConversationId || null
      const messages = [...records].reverse().map((message, index) => {
        if (typeof message?.content !== 'string') {
          throw new ChatError('تعذر قراءة إحدى رسائل المحادثة.')
        }

        return {
          ...message,
          uiId: String(message._id ?? `restored-${index}`),
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content,
        }
      })
      return {conversationId, messages}
    } catch (error) {
      if (error instanceof ChatError) throw error
      throw new ChatError('تعذر استعادة المحادثة. تحقق من اتصالك ثم حاول مرة أخرى.', error)
    }
  }

  async getConversations() {
    try {
      const conversations = await this.api.getConversations()
      if (!Array.isArray(conversations)) throw new ChatError('تعذر قراءة قائمة المحادثات.')
      return conversations
    } catch (error) {
      if (error instanceof ChatError) throw error
      throw new ChatError('تعذر استعادة قائمة المحادثات. تحقق من اتصالك ثم حاول مرة أخرى.', error)
    }
  }

  async createConversation() {
    try {
      const conversation = await this.api.createConversation()
      if (!conversation?.id || typeof conversation.title !== 'string') {
        throw new ChatError('تعذر إنشاء المحادثة.')
      }
      return conversation
    } catch (error) {
      if (error instanceof ChatError) throw error
      throw new ChatError('تعذر بدء محادثة جديدة. تحقق من اتصالك ثم حاول مرة أخرى.', error)
    }
  }
}

export default Chat
