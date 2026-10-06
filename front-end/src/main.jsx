import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './features/auth/context/AuthContext.jsx'
import './app/styles/reset.css'
import './app/styles/variables.css'
import './app/styles/global.css'

createRoot(document.getElementById('root')).render(<StrictMode><AuthProvider><App /></AuthProvider></StrictMode>)
