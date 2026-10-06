import { ArrowUp, Feather, Quote, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { mockPrompts } from '../data/mockPrompts.js'
import BrandLogo from '../../../shared/components/BrandLogo.jsx'

function WelcomeScreen({ onPromptSelect, onSend, disabled = false }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (disabled || !question.trim()) return
    onSend?.(question.trim())
    setQuestion('')
  }

  return <section className="welcome-screen" aria-labelledby="welcome-title">
    <div className="welcome-screen__light welcome-screen__light--one" aria-hidden="true" /><div className="welcome-screen__light welcome-screen__light--two" aria-hidden="true" />
    <div className="welcome-screen__content">
      <div className="welcome-screen__intro"><div className="welcome-screen__brand"><BrandLogo /></div><span className="welcome-screen__kicker"><Sparkles size={14} aria-hidden="true" /> مساحة هادئة للأسئلة الصادقة</span><h1 id="welcome-title">اكتشف عمق<br /><em>كلمة الله</em></h1><p>مساحة للحوار والتأمل وفهم الكتاب المقدس، خطوة بخطوة وبقلب مفتوح.</p></div>
      <form className="welcome-composer-shell" onSubmit={handleSubmit}><div className="composer-label"><i /> ابدأ بسؤال</div><textarea aria-label="سؤالك عن الكتاب المقدس" placeholder="اكتب سؤالك عن الكتاب المقدس..." rows="2" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /><div className="composer-footer"><span><Feather size={14} aria-hidden="true" /> حوار للتأمل والفهم</span><button type="submit" disabled={disabled || !question.trim()}><span>إرسال السؤال</span><ArrowUp size={17} aria-hidden="true" /></button></div></form>
      <div className="prompt-section"><div className="prompt-heading"><div><span>ابدأ من هنا</span><h2>أسئلة تستحق التأمل</h2></div><Quote size={24} aria-hidden="true" /></div><div className="prompt-grid">{mockPrompts.map((item) => <button className={`prompt-card prompt-card--${item.tone}`} key={item.prompt} onClick={() => onPromptSelect(item.prompt)} type="button"><span>{item.label}</span><strong>{item.prompt}</strong><ArrowUp size={17} aria-hidden="true" /></button>)}</div></div>
    </div>
  </section>
}
export default WelcomeScreen
