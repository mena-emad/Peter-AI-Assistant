import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import BrandLogo from '../../../shared/components/BrandLogo.jsx'
import IconButton from '../../../shared/components/IconButton.jsx'
import ChatMarkdown from './ChatMarkdown.jsx'
import ScriptureCard from '../../scripture/components/ScriptureCard.jsx'

function ChatMessage({ message, onCopy }) {
  const [copied, setCopied] = useState(false)
  const assistant = message.role === 'assistant'
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      onCopy?.(message)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }
  return <article className={`chat-message chat-message--${message.role}`}>
    <div className="chat-message__content">
      {assistant ? (
        <div className="message-author">
          <div className="assistant-mark"><BrandLogo compact /></div>
          <div><strong>بطرس</strong><span>مساعدك في فهم الكتاب المقدس</span></div>
        </div>
      ) : (
        <div className="message-author message-author--user"><strong>أنت</strong></div>
      )}
      <div className="message-text">
        {assistant ? <ChatMarkdown content={message.content} /> : message.content.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {message.scripture && <ScriptureCard {...message.scripture} />}
      {assistant && <div className="message-actions"><IconButton label={copied ? 'تم النسخ' : 'نسخ الإجابة'} icon={copied ? Check : Copy} onClick={handleCopy} />{copied && <small>تم النسخ</small>}</div>}
    </div>
  </article>
}
export default ChatMessage
