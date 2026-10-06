import { API_BASE_URL, httpClient } from '../../../shared/api/httpClient.js'

class AuthApi {
  getGoogleLoginUrl() {
    return `${API_BASE_URL}/auth/google`
  }

  async getCurrentUser() {
    const { data } = await httpClient.get(`${API_BASE_URL}/auth/me`)
    if (!data || typeof data.email !== 'string') throw new TypeError('بيانات الحساب غير متاحة.')
    return data
  }

  async logout() {
    await httpClient.post(`${API_BASE_URL}/auth/logout`)
  }
}

const authApi = new AuthApi()
export default authApi