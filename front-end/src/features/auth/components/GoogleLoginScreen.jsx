import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import BrandLogo from '../../../shared/components/BrandLogo.jsx'
import './auth.css'

function GoogleLoginScreen({ onLogin, error }) {
  const [loginError, setLoginError] = useState(() => {
    return new URLSearchParams(window.location.search).get('authError') === 'google'
      ? 'تعذر إكمال تسجيل الدخول باستخدام Google. حاول مرة أخرى.'
      : null
  })

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('authError')) return
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  return <main className="auth-page" dir="rtl">
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art__glow" />
        <div className="auth-art__arch"><div className="auth-art__window"><span className="auth-art__cross" /></div></div>
        <div className="auth-art__book"><BookOpen size={38} strokeWidth={1.25} /></div>
        <div className="auth-art__caption"><span>كلمة تهدي القلب</span><strong>«وأما أنا فقد أتيت لتكون لهم حياة»</strong><small>يوحنا ١٠:١٠</small></div>
        <span className="auth-art__spark auth-art__spark--one" />
        <span className="auth-art__spark auth-art__spark--two" />
      </div>

      <div className="auth-content">
        <BrandLogo />
        <span className="auth-eyebrow"><Sparkles size={14} aria-hidden="true" /> رفيقك في التأمل والفهم</span>
        <h1 id="auth-title">مرحبًا بك في <em>بطرس</em></h1>
        <p className="auth-content__lead">مساعدك الذكي لفهم الكتاب المقدس والتأمل في كلمة الله.</p>
        <p className="auth-content__body">هنا يمكنك أن تسأل، وتتأمل، وتبحث في كلمة الله، في رحلة معرفة وإيمان.</p>
        <button className="google-login-button" type="button" onClick={onLogin}>
          <span className="google-login-button__mark" aria-hidden="true">G</span>
          <span>المتابعة باستخدام Google</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
        {(error || loginError) && <p className="auth-error" role="alert">{loginError || error}</p>}
        <p className="auth-privacy">تسجيل آمن عبر حساب Google. لا نخزن بيانات الدخول في المتصفح.</p>
        <div className="auth-verse"><span>✝</span><p>«أنت بطرس، وعلى هذه الصخرة أبني كنيستي»</p></div>
      </div>
    </section>
  </main>
}

export default GoogleLoginScreen