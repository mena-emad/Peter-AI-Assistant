import ChatApi from './Chat.api.js'
import { API_BASE_URL, httpClient } from '../../../shared/api/httpClient.js'

const chatApi = new ChatApi(API_BASE_URL, httpClient)
export default chatApi
