import { LogOut, Plus, Settings2, Sparkles } from 'lucide-react'
import BrandLogo from '../shared/components/BrandLogo.jsx'
import IconButton from '../shared/components/IconButton.jsx'
import './styles/layout.css'
import '../shared/styles/components.css'
import '../features/welcome/styles/welcome.css'
import '../features/chat/styles/chat.css'
import '../features/scripture/styles/scripture.css'

function AppLayout({ children, onNewChat, canStartNewChat, sidebar, user, onLogout }) {
  return <div className="app-shell">
    <header className="top-bar">
      <BrandLogo />
      <div className="top-bar__identity"><Sparkles size={14} aria-hidden="true" /><span>مساعدك في فهم الكتاب المقدس</span></div>
      <div className="top-bar__actions">
        <span className="top-bar__user" title={user?.email}>{user?.name}</span>
        <button className="new-chat-button" type="button" onClick={onNewChat} disabled={!canStartNewChat} title={canStartNewChat ? 'محادثة جديدة' : 'بدء محادثة منفصلة غير متاح حاليًا'}><Plus size={16} aria-hidden="true" /> محادثة جديدة</button>
        <IconButton label="الإعدادات" icon={Settings2} />
        <IconButton label="تسجيل الخروج" icon={LogOut} onClick={onLogout} />
      </div>
    </header>
    <main className="app-main"><div className="app-main__layout">{sidebar}<div className="app-main__content">{children}</div></div></main>
  </div>
}
export default AppLayout
