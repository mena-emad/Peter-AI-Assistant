import { useEffect, useState } from 'react'
import AppLayout from './layout/AppLayout.jsx'
import ConversationSidebar from './layout/ConversationSidebar.jsx'
import WelcomeScreen from './features/welcome/components/WelcomeScreen.jsx'
import ChatWindow from './features/chat/components/ChatWindow.jsx'
import useChat from './features/chat/hooks/useChat.js'
import useAuth from './features/auth/hooks/useAuth.js'
import GoogleLoginScreen from './features/auth/components/GoogleLoginScreen.jsx'
import AuthLoadingScreen from './features/auth/components/AuthLoadingScreen.jsx'
import { readConversationIndex, upsertConversationIndex, writeConversationIndex } from './features/chat/state/conversationIndex.js'

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
  const userId = String(auth.user._id || auth.user.id)
  const [route, setRoute] = useState(() => {
    const conversationId = readConversationId()
    return { conversationId, view: conversationId ? 'chat' : 'welcome' }
  })
  const [conversations, setConversations] = useState(() => readConversationIndex(userId))
  const { messages, isLoading, error, sendMessage, startNewConversation, activeConversationId } = useChat(route.conversationId)

  useEffect(() => {
    const handlePopState = () => {
      const conversationId = readConversationId()
      setRoute({ conversationId, view: conversationId ? 'chat' : 'welcome' })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    writeConversationIndex(conversations, userId)
  }, [conversations, userId])

  useEffect(() => {
    if (!activeConversationId || isLoading) return
    if (route.conversationId !== activeConversationId) {
      const path = `/chat/${encodeURIComponent(activeConversationId)}`
      if (window.location.pathname !== path) window.history.replaceState({}, '', path)
      setRoute({ conversationId: activeConversationId, view: 'chat' })
      return
    }
    if (error) return
    const firstUserMessage = messages.find((message) => message.role === 'user')
    if (!firstUserMessage) return
    setConversations((current) => upsertConversationIndex(current, route.conversationId, firstUserMessage.content))
  }, [activeConversationId, error, isLoading, messages, route.conversationId])

  const handleSend = async (content) => {
    setRoute((current) => ({ ...current, view: 'chat' }))
    const response = await sendMessage(content)
    if (response?.conversationId) {
      setConversations((current) => upsertConversationIndex(current, response.conversationId, content))
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

  const handleNewChat = () => {
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/')
    startNewConversation()
    setRoute({ conversationId: null, view: 'welcome' })
  }

  return <AppLayout
    onNewChat={handleNewChat}
    canStartNewChat={!isLoading}
    user={auth.user}
    onLogout={auth.logout}
    sidebar={<ConversationSidebar
      conversations={conversations}
      activeConversationId={route.conversationId}
      onSelectConversation={handleSelectConversation}
    />}
  >
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
