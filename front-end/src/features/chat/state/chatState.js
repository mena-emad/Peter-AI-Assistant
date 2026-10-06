export const initialChatState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,
}

export function chatReducer(state, action) {
  switch (action.type) {
    case 'send-start':
      return {
        ...state,
        messages: action.userMessage ? [...state.messages, action.userMessage] : state.messages,
        isLoading: true,
        error: null,
      }
    case 'send-success':
      return {
        ...state,
        messages: [...state.messages, action.assistantMessage],
        isLoading: false,
        error: null,
        conversationId: action.conversationId,
      }
    case 'send-error':
      return { ...state, isLoading: false, error: action.message }
    case 'load-start':
      return { messages: [], isLoading: true, error: null, conversationId: action.conversationId }
    case 'load-success':
      return { messages: action.messages, isLoading: false, error: null, conversationId: action.conversationId }
    case 'load-error':
      return { messages: [], isLoading: false, error: action.message, conversationId: action.conversationId }
    case 'conversation-reset':
      return initialChatState
    case 'new-conversation':
      return {
        ...initialChatState,
        isLoading: Boolean(action.isRequestPending),
        ...(action.pendingRequestId ? { pendingRequestId: action.pendingRequestId } : {}),
      }
    case 'request-finished':
      if (action.requestId && state.pendingRequestId !== action.requestId) return state
      return initialChatState
    default:
      return state
  }
}

export function createUiMessage(role, content) {
  return { uiId: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content }
}
