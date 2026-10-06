import { useCallback, useEffect, useReducer, useRef } from 'react'
import Chat from '../domain/Chat.js'
import chatApi from '../api/chatClient.js'
import { chatReducer, createUiMessage, initialChatState } from '../state/chatState.js'

function createInitialState(conversationId) {
  return conversationId
    ? { ...initialChatState, conversationId, isLoading: true }
    : initialChatState
}

function useChat(conversationId = null) {
  const [state, dispatch] = useReducer(chatReducer, conversationId, createInitialState)
  const chatRef = useRef(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(null)
  const loadPromiseRef = useRef(null)
  const skipLoadForIdRef = useRef(null)

  if (!chatRef.current) chatRef.current = new Chat(chatApi)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    let cancelled = false

    if (!conversationId) {
      dispatch({ type: 'conversation-reset' })
      return () => {
        cancelled = true
        if (requestId === requestIdRef.current) requestIdRef.current += 1
      }
    }
    if (conversationId && skipLoadForIdRef.current === conversationId) {
      skipLoadForIdRef.current = null
      return () => {
        cancelled = true
        if (requestId === requestIdRef.current) requestIdRef.current += 1
      }
    }

    inFlightRef.current = null
    dispatch({ type: 'load-start', conversationId })
    let load = loadPromiseRef.current
    if (!load || load.conversationId !== conversationId) {
      load = {
        conversationId,
        promise: chatRef.current.getCurrentChat(conversationId),
      }
      loadPromiseRef.current = load
    }

    const clearLoad = () => {
      if (loadPromiseRef.current === load) loadPromiseRef.current = null
    }

    load.promise
      .then((messages) => {
        clearLoad()
        if (!cancelled && requestId === requestIdRef.current) {
          dispatch({
            type: 'load-success',
            conversationId: messages.conversationId || conversationId,
            messages: messages.messages,
          })
        }
      })
      .catch((error) => {
        clearLoad()
        if (!cancelled && requestId === requestIdRef.current) {
          dispatch({
            type: 'load-error',
            conversationId,
            message: error?.message || 'تعذر استعادة المحادثة. حاول مرة أخرى.',
          })
        }
      })

    return () => {
      cancelled = true
      if (requestId === requestIdRef.current) requestIdRef.current += 1
    }
  }, [conversationId])

  const submit = useCallback(async (content, includeUserMessage) => {
    const message = typeof content === 'string' ? content.trim() : ''
    if (!message || inFlightRef.current !== null) return false

    const requestId = ++requestIdRef.current
    inFlightRef.current = requestId
    dispatch({
      type: 'send-start',
      userMessage: includeUserMessage ? createUiMessage('user', message) : null,
    })

    try {
      const response = await chatRef.current.sendMessage(message, { newConversation: !conversationId })

      if (requestId !== requestIdRef.current) return false
      if (conversationId !== response.conversationId) {
        skipLoadForIdRef.current = response.conversationId
      }
      dispatch({
        type: 'send-success',
        assistantMessage: createUiMessage('assistant', response.content),
        conversationId: response.conversationId,
      })
      return response
    } catch (error) {
      if (requestId !== requestIdRef.current) return false
      dispatch({
        type: 'send-error',
        message: error?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.',
      })
      return false
    } finally {
      if (inFlightRef.current === requestId) inFlightRef.current = null
      if (requestId !== requestIdRef.current) {
        dispatch({ type: 'request-finished', requestId })
      }
    }
  }, [conversationId])

  const sendMessage = useCallback((content) => submit(content, true), [submit])
  const startNewConversation = useCallback(() => {
    const pendingRequestId = inFlightRef.current
    requestIdRef.current += 1
    inFlightRef.current = null
    dispatch({
      type: 'new-conversation',
      isRequestPending: pendingRequestId !== null,
      pendingRequestId,
    })
  }, [])

  const getConversations = useCallback(() => chatRef.current.getConversations(), [])

  return {
    messages: state.conversationId === conversationId ? state.messages : [],
    isLoading: state.conversationId === conversationId ? state.isLoading : Boolean(conversationId),
    error: state.conversationId === conversationId ? state.error : null,
    activeConversationId: state.conversationId,
    sendMessage,
    startNewConversation,
    getConversations,
  }
}

export default useChat
