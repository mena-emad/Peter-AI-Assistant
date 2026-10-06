import VersesRepository from "./src/modules/verses/verses.repository.js";
import VersesService from "./src/modules/verses/verses.service.js";
import ChatRepository from "./src/modules/chat/chat.repository.js";
import ChatService from "./src/modules/chat/chat.service.js";
import ChatController from "./src/modules/chat/chat.controller.js"
import ChatRoutes from "./src/modules/chat/chat.routes.js";
import tools from "./src/mcp/tools.js";
import ChatHistory from "./src/data/ChatHistory.js";
import Conversation from "./src/data/Conversation.js"
import mapToolsToGemini from "./src/utils/mapToolsToGemini.js";
import { protect } from "./src/middlewares/auth.js";
import AuthRepository from "./src/modules/auth/auth.repository.js";
import AuthService from "./src/modules/auth/auth.service.js";
import AuthController from "./src/modules/auth/auth.controller.js";
import AuthRoutes from "./src/modules/auth/auth.routes.js";
import googleClient from "./src/config/google.js";
import User from "./src/data/User.js";
import Sessions from "./src/data/Sessions.js";
const geminiTools = mapToolsToGemini(tools)
const versesRepository = new VersesRepository();
const versesService = new VersesService(versesRepository);
const chatRepository = new ChatRepository("gemini-3.5-flash-lite",tools,geminiTools,Conversation,ChatHistory);
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);
export const chatRoutes = new ChatRoutes(chatController,protect);
const authRepository = new AuthRepository(User,Sessions);
const authService = new AuthService(authRepository,googleClient);
const authController = new AuthController(authService);
export const authRoutes = new AuthRoutes(authController,protect);

export default versesService;