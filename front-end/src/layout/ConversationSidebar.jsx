import { MessageSquareText } from 'lucide-react'

function ConversationSidebar({ conversations, activeConversationId, onSelectConversation }) {
  return <aside className="conversation-sidebar" aria-label="المحادثات السابقة">
    <h2 className="conversation-sidebar__heading">كل المحادثات</h2>
    {conversations.length ? (
      <nav className="conversation-sidebar__list" aria-label="قائمة المحادثات">
        {conversations.map((conversation) => (
          <button
            className={`conversation-sidebar__item${conversation.id === activeConversationId ? ' is-active' : ''}`}
            key={conversation.id}
            type="button"
            aria-current={conversation.id === activeConversationId ? 'page' : undefined}
            onClick={() => onSelectConversation(conversation.id)}
            title={conversation.title}
          >
            <MessageSquareText size={16} aria-hidden="true" />
            <span>{conversation.title}</span>
          </button>
        ))}
      </nav>
    ) : (
      <p className="conversation-sidebar__empty">ستظهر محادثاتك هنا</p>
    )}
  </aside>
}

export default ConversationSidebar