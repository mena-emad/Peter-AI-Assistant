import BrandLogo from '../../../shared/components/BrandLogo.jsx'
import './auth.css'

function AuthLoadingScreen() {
  return <main className="auth-loading" role="status" aria-label="جارٍ التحقق من جلسة الدخول">
    <BrandLogo />
    <span className="auth-loading__spinner" />
    <p>لحظات ونكون معك</p>
  </main>
}

export default AuthLoadingScreen