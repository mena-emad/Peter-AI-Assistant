import Chat from "./src/features/chat/api/Chat.api.js"
import axios from "axios"

const chat = new Chat(process.env.VITE_BASE_URL,axios)
try{
    await chat.sendMessage("Hello")
}catch (error) {
    if (error.response) {
        // السيرفر رد بكود خطأ (مثال: 404 أو 500)
        console.error("❌ السيرفر رد بخطأ:", error.response.status);
        console.error("📄 محتوى الخطأ:", error.response.data);
    } else if (error.request) {
        // الطلب تم إرساله لكن لم يصل رد
        console.error("⏳ لم يتم استقبال رد من السيرفر:", error.message);
    } else {
        console.error("🛠️ خطأ في إعداد الطلب:", error.message);
    }
}