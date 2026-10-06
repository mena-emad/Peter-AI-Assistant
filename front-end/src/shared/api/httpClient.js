import axios from 'axios'

const configuredBaseURL = import.meta.env.VITE_BASE_URL || '/api/v1'
export const API_BASE_URL = (import.meta.env.DEV ? '/api/v1' : configuredBaseURL).replace(/\/+$/, '')
export const AUTH_EXPIRED_EVENT = 'bible-ai:auth-expired'

export const httpClient = axios.create({ withCredentials: true })

let refreshRequest

httpClient.interceptors.response.use(undefined, async (error) => {
  const request = error.config
  const requestUrl = request?.url || ''
  const isRefreshRequest = requestUrl.includes('/auth/refresh')
  const isLogoutRequest = requestUrl.includes('/auth/logout')

  if (error.response?.status !== 401 || !request || request._authRetry || isRefreshRequest || isLogoutRequest) {
    return Promise.reject(error)
  }

  request._authRetry = true
  try {
    refreshRequest ??= httpClient.post(`${API_BASE_URL}/auth/refresh`).finally(() => {
      refreshRequest = null
    })
    await refreshRequest
    return await httpClient(request)
  } catch (refreshError) {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    return Promise.reject(refreshError)
  }
})