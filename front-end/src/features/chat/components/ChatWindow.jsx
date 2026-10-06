import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react'
import ChatMessage from './ChatMessage.jsx'
import MessageComposer from './MessageComposer.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import IconButton from '../../../shared/components/IconButton.jsx'

function ChatWindow({ messages, isLoading, error, onSend }) {
  return <section className="chat-window" aria-label="المحادثة مع بطرس"><div className="chat-window__intro"><div className="chat-crumb"><IconButton label="بدء محادثة منفصلة غير متاح حاليًا" icon={ArrowRight} disabled /><span>محادثة مع بطرس</span></div><div className="chat-topic"><span className="chat-topic__icon"><BookOpen size={17} aria-hidden="true" /></span><div><small>مساعدك في فهم الكتاب المقدس</small><strong>حوار حول الكتاب المقدس</strong></div></div></div><div className="chat-messages" aria-live="polite"><div className="chat-date"><span>الحوار الحالي</span></div>{messages.map((message) => <ChatMessage key={message.uiId} message={message} />)}{isLoading && (messages.length === 0 ? <div role="status">جارٍ تحميل المحادثة...</div> : <TypingIndicator />)}{error && <div className="chat-error" role="alert">{error}</div>}</div><div className="chat-composer-wrap"><MessageComposer onSend={onSend} disabled={isLoading} /><div className="chat-trust"><ShieldCheck size={13} aria-hidden="true" /> هذه مساحة هادئة لسؤالك وتأملك</div></div></section>
}
export default ChatWindow
