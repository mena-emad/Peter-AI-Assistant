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
  const [isNewConversation, setIsNewConversation] = useState(false)
  const { messages, isLoading, error, sendMessage, startNewConversation, getConversations } = useChat(route.conversationId)

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
        }
      })
      .catch(() => {
        if (active) {
          setConversations([])
        }
      })
    return () => { active = false }
  }, [getConversations])

  useEffect(() => {
    const handlePopState = () => {
      const conversationId = readConversationId()
      setIsNewConversation(false)
      setRoute({ conversationId, view: conversationId ? 'chat' : 'welcome' })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleSend = async (content) => {
    setIsNewConversation(false)
    setRoute((current) => ({ ...current, view: 'chat' }))
    const response = await sendMessage(content)
    if (response?.conversationId) {
      setIsNewConversation(false)
      refreshConversations().catch(() => {})
      const path = `/chat/${encodeURIComponent(response.conversationId)}`
      if (window.location.pathname !== path) window.history.pushState({}, '', path)
      setRoute({ conversationId: response.conversationId, view: 'chat' })
    }
    return response
  }

  const handleSelectConversation = (conversationId) => {
    setIsNewConversation(false)
    const path = `/chat/${encodeURIComponent(conversationId)}`
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setRoute({ conversationId, view: 'chat' })
  }

  const handleNewChat = () => {
    setIsNewConversation(true)
    startNewConversation()
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/')
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
    {route.view === 'welcome' || isNewConversation ? (
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
