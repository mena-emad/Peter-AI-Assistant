import { ArrowUp, Paperclip } from 'lucide-react'
import { useState } from 'react'
import IconButton from '../../../shared/components/IconButton.jsx'

function MessageComposer({ onSend, disabled = false, placeholder = 'اكتب سؤالك عن الكتاب المقدس...' }) {
  const [value, setValue] = useState('')
  const handleSubmit = (event) => { event.preventDefault(); if (disabled || !value.trim()) return; onSend?.(value.trim()); setValue('') }
  return <form className="message-composer" onSubmit={handleSubmit}><div className="message-composer__box"><textarea aria-label="رسالتك إلى بطرس" placeholder={placeholder} rows="1" value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><div className="composer-tools"><IconButton label="إرفاق مرجع للربط لاحقًا" icon={Paperclip} type="button" disabled /><button className="composer-send" aria-label="إرسال الرسالة" title="إرسال الرسالة" type="submit" disabled={disabled || !value.trim()}><ArrowUp size={18} strokeWidth={2.3} aria-hidden="true" /></button></div></div><p>بطرس يساعدك على استكشاف الكتاب المقدس، سؤالًا بعد سؤال.</p></form>
}
export default MessageComposer
