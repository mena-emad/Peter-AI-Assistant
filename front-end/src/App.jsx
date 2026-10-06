import { useCallback, useEffect, useState } from 'react'
import AppLayout from './layout/AppLayout.jsx'
import ConversationSidebar from './layout/ConversationSidebar.jsx'
import WelcomeScreen from './features/welcome/components/WelcomeScreen.jsx'
import ChatWindow from './features/chat/components/ChatWindow.jsx'
import useChat from './features/chat/hooks/useChat.js'
import useAuth from './features/auth/hooks/useAuth.js'
import GoogleLoginScreen from './features/auth/components/GoogleLoginScreen.jsx'
import AuthLoadingScreen from './features/auth/components/AuthLoadingScreen.jsx'

function readConversationId() {
  const match = window.location.pathname.match(/^\/chat\/([^/]+)\/?$/)
  if (!match) return null

  try {
    return decodeURIComponent(match[1]) || null
  } catch {
    return null
  }
}

function AuthenticatedChatApplication({ auth }) {
  const [route, setRoute] = useState(() => {
    const conversationId = readConversationId()
    return { conversationId, view: conversationId ? 'chat' : 'welcome' }
  })
  const [conversations, setConversations] = useState([])
  const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [conversationError, setConversationError] = useState(null)
  const { messages, isLoading, error, sendMessage, startNewConversation, getConversations, createConversation, activeConversationId } = useChat(route.conversationId)

  const refreshConversations = useCallback(async () => {
    const latest = await getConversations()
    setConversations(latest)
    return latest
  }, [getConversations])

  useEffect(() => {
    let active = true
    getConversations()
      .then((latest) => {
        if (active) {
          setConversations(latest)
          setConversationsLoaded(true)
        }
      })
      .catch(() => {
        if (active) {
          setConversations([])
          setConversationsLoaded(true)
        }
      })
    return () => { active = false }
  }, [getConversations])

  useEffect(() => {
    if (!conversationsLoaded || route.conversationId || conversations.length === 0) return
    const conversationId = conversations[0].id
    const path = `/chat/${encodeURIComponent(conversationId)}`
    if (window.location.pathname !== path) window.history.replaceState({}, '', path)
    setRoute({ conversationId, view: 'chat' })
  }, [conversations, conversationsLoaded, route.conversationId])

  useEffect(() => {
    const handlePopState = () => {
      const conversationId = readConversationId()
      setRoute({ conversationId, view: conversationId ? 'chat' : 'welcome' })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!activeConversationId || isLoading) return
    if (route.conversationId !== activeConversationId) {
      const path = `/chat/${encodeURIComponent(activeConversationId)}`
      if (window.location.pathname !== path) window.history.replaceState({}, '', path)
      setRoute({ conversationId: activeConversationId, view: 'chat' })
      return
    }
  }, [activeConversationId, isLoading, route.conversationId])

  const handleSend = async (content) => {
    setRoute((current) => ({ ...current, view: 'chat' }))
    const response = await sendMessage(content)
    if (response?.conversationId) {
      refreshConversations().catch(() => {})
      const path = `/chat/${encodeURIComponent(response.conversationId)}`
      if (window.location.pathname !== path) window.history.pushState({}, '', path)
      setRoute({ conversationId: response.conversationId, view: 'chat' })
    }
    return response
  }

  const handleSelectConversation = (conversationId) => {
    const path = `/chat/${encodeURIComponent(conversationId)}`
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setRoute({ conversationId, view: 'chat' })
  }

  const handleNewChat = async () => {
    if (isCreatingConversation) return
    setIsCreatingConversation(true)
    setConversationError(null)
    try {
      const conversation = await createConversation()
    startNewConversation()
      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)])
      const path = `/chat/${encodeURIComponent(conversation.id)}`
      if (window.location.pathname !== path) window.history.pushState({}, '', path)
      setRoute({ conversationId: conversation.id, view: 'chat' })
    } catch (createError) {
      setConversationError(createError?.message || 'تعذر بدء محادثة جديدة.')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return <AppLayout
    onNewChat={handleNewChat}
    canStartNewChat={!isLoading && !isCreatingConversation}
    user={auth.user}
    onLogout={auth.logout}
    sidebar={<ConversationSidebar
      conversations={conversations}
      activeConversationId={route.conversationId}
      onSelectConversation={handleSelectConversation}
    />}
  >
    {conversationError ? <p role="alert">{conversationError}</p> : null}
    {route.view === 'welcome' ? (
      <WelcomeScreen onPromptSelect={handleSend} onSend={handleSend} disabled={isLoading} />
    ) : (
      <ChatWindow messages={messages} isLoading={isLoading} error={error} onSend={handleSend} />
    )}
  </AppLayout>
}

function App() {
  const auth = useAuth()

  if (auth.isLoading) return <AuthLoadingScreen />
  if (!auth.isAuthenticated) {
    return <GoogleLoginScreen onLogin={auth.loginWithGoogle} error={auth.error} />
  }

  return <AuthenticatedChatApplication auth={auth} />
}

export default App
