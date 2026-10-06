import test from 'node:test'
import assert from 'node:assert/strict'
import ChatApi from '../api/Chat.api.js'
import Chat, { ChatError } from './Chat.js'
import { chatReducer, initialChatState } from '../state/chatState.js'

test('ChatApi posts a trimmed message to the configured chat endpoint', async () => {
  const calls = []
  const api = {
    post: async (...args) => {
      calls.push(args)
      return { data: { result: 'إجابة المساعد', conversationId: 'conversation-1' } }
    },
  }
  const chatApi = new ChatApi('http://localhost:3000/api/v1/', api)

  const response = await chatApi.sendMessage('  سؤالي  ')

  assert.deepEqual(response, { content: 'إجابة المساعد', conversationId: 'conversation-1' })
  assert.deepEqual(calls, [['http://localhost:3000/api/v1/chat', { message: 'سؤالي' }]])
})

test('ChatApi marks the first message in a new UI conversation', async () => {
  const calls = []
  const chatApi = new ChatApi('/api/v1', {
    post: async (...args) => {
      calls.push(args)
      return { data: { result: 'إجابة', conversationId: 'conversation-1' } }
    },
  })

  await chatApi.sendMessage('  بداية المحادثة  ', { newConversation: true })
  assert.deepEqual(calls, [['/api/v1/chat', { message: 'بداية المحادثة', newConversation: true }]])
})

test('ChatApi rejects empty messages without making a request', async () => {
  let called = false
  const chatApi = new ChatApi('/api/v1', {
    post: async () => { called = true; return { data: {} } },
  })

  await assert.rejects(chatApi.sendMessage('  '), TypeError)
  assert.equal(called, false)
})

test('ChatApi uses the existing chats endpoint and relies on the HTTP-only cookie', async () => {
  const calls = []
  const messages = [{ _id: 'message-1', role: 'user', content: 'سؤال' }]
  const chatApi = new ChatApi('/api/v1', {
    get: async (...args) => {
      calls.push(args)
      return { data: messages }
    },
  })

  assert.deepEqual(await chatApi.getCurrentChat(), messages)
  assert.deepEqual(calls, [['/api/v1/chats']])
})

test('ChatApi loads conversations from the backend', async () => {
  const calls = []
  const conversations = [{ id: 'conversation-1', title: 'سؤال أول' }]
  const chatApi = new ChatApi('/api/v1', {
    get: async (...args) => {
      calls.push(args)
      return { data: conversations }
    },
  })

  assert.deepEqual(await chatApi.getConversations(), conversations)
  assert.deepEqual(calls, [['/api/v1/conversations']])
})

test('ChatApi selects a conversation by POST body so the backend can update its HTTP-only cookie', async () => {
  const calls = []
  const chatApi = new ChatApi('/api/v1', {
    post: async (...args) => { calls.push(args); return { data: null } },
  })

  await chatApi.selectCurrentChat('conversation-1')
  assert.deepEqual(calls, [['/api/v1/chats/active', { conversationId: 'conversation-1' }]])
})

test('Chat business class returns the backend text and normalizes transport failures', async () => {
  const api = { sendMessage: async (message) => ({ content: `رد: ${message}`, conversationId: 'conversation-1' }) }
  const chat = new Chat(api)
  assert.deepEqual(await chat.sendMessage('  سؤال  '), { content: 'رد: سؤال', conversationId: 'conversation-1' })

  const brokenChat = new Chat({ sendMessage: async () => { throw new Error('transport detail') } })
  await assert.rejects(brokenChat.sendMessage('سؤال'), (error) => {
    assert.ok(error instanceof ChatError)
    assert.match(error.message, /تعذر إرسال رسالتك/)
    assert.equal(error.cause.message, 'transport detail')
    return true
  })
})

test('Chat restores records as chronological UI messages with assistant roles', async () => {
  const chat = new Chat({
    getCurrentChat: async () => [
      { _id: 'assistant-1', conversationId: 'conversation-1', role: 'model', content: 'إجابة' },
      { _id: 'user-1', conversationId: 'conversation-1', role: 'user', content: 'سؤال' },
    ],
  })

  assert.deepEqual(await chat.getCurrentChat(), {
    conversationId: 'conversation-1',
    messages: [
      { _id: 'user-1', conversationId: 'conversation-1', uiId: 'user-1', role: 'user', content: 'سؤال' },
      { _id: 'assistant-1', conversationId: 'conversation-1', uiId: 'assistant-1', role: 'assistant', content: 'إجابة' },
    ],
  })
})

test('Chat selects a route conversation before loading the cookie-backed current chat', async () => {
  const calls = []
  const chat = new Chat({
    selectCurrentChat: async (id) => calls.push(['select', id]),
    getCurrentChat: async () => {
      calls.push(['load'])
      return [{ _id: 'user-1', conversationId: 'conversation-1', role: 'user', content: 'سؤال' }]
    },
  })

  await chat.getCurrentChat('conversation-1')
  assert.deepEqual(calls, [['select', 'conversation-1'], ['load']])
})

test('chat reducer adds one optimistic user message and the assistant response', () => {
  const userMessage = { uiId: 'user-1', role: 'user', content: 'سؤال' }
  const assistantMessage = { uiId: 'assistant-1', role: 'assistant', content: 'إجابة' }
  const sending = chatReducer(initialChatState, { type: 'send-start', userMessage })
  assert.deepEqual(sending.messages, [userMessage])
  assert.equal(sending.isLoading, true)

  const complete = chatReducer(sending, { type: 'send-success', assistantMessage })
  assert.deepEqual(complete.messages, [userMessage, assistantMessage])
  assert.equal(complete.isLoading, false)
  assert.equal(complete.error, null)
})

test('chat reducer clears loading after error and resets local conversation state', () => {
  const sending = chatReducer(initialChatState, {
    type: 'send-start',
    userMessage: { uiId: 'user-1', role: 'user', content: 'سؤال' },
  })
  const failed = chatReducer(sending, { type: 'send-error', message: 'تعذر الإرسال' })
  assert.equal(failed.isLoading, false)
  assert.equal(failed.error, 'تعذر الإرسال')
  assert.equal(failed.messages.length, 1)

  assert.deepEqual(chatReducer(failed, { type: 'new-conversation' }), initialChatState)
})

test('local reset stays locked until an earlier request settles', () => {
  const resetWhileSending = chatReducer(initialChatState, {
    type: 'new-conversation',
    isRequestPending: true,
  })
  assert.equal(resetWhileSending.messages.length, 0)
  assert.equal(resetWhileSending.isLoading, true)
  assert.deepEqual(chatReducer(resetWhileSending, { type: 'request-finished' }), initialChatState)
})
