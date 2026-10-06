import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import authApi from '../api/Auth.api.js'
import { AUTH_EXPIRED_EVENT } from '../../../shared/api/httpClient.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const checkAuthRequestRef = useRef(null)

  const checkAuth = useCallback(() => {
    if (checkAuthRequestRef.current) return checkAuthRequestRef.current
    setIsLoading(true)
    const request = authApi.getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setError(null)
        return currentUser
      })
      .catch((requestError) => {
        setUser(null)
        if (requestError.response?.status !== 401) {
          setError('تعذر الاتصال بخدمة الحساب. تحقق من اتصالك ثم أعد المحاولة.')
        }
        return null
      })
      .finally(() => {
        setIsLoading(false)
        if (checkAuthRequestRef.current === request) checkAuthRequestRef.current = null
      })
    checkAuthRequestRef.current = request
    return request
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      setIsLoading(false)
      setError(null)
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    checkAuth()
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [checkAuth])

  const loginWithGoogle = useCallback(() => {
    setError(null)
    window.location.assign(authApi.getGoogleLoginUrl())
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      setError('تم إنهاء الجلسة على هذا الجهاز.')
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  return <AuthContext.Provider value={{
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    checkAuth,
    loginWithGoogle,
    logout,
  }}>{children}</AuthContext.Provider>
}