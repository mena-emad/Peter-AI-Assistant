import 'dotenv/config'
import cookieParser from "cookie-parser"
import {authRoutes,chatRoutes} from "../container.js"
import express from "express";



const app = express();
app.use(cookieParser());

const configuredFrontendUrl = process.env.FRONTEND_URL
const allowedFrontendOrigin = configuredFrontendUrl ? new URL(configuredFrontendUrl).origin : null
app.use((req,res,next)=>{
	const origin = req.headers.origin
	if (origin && allowedFrontendOrigin && origin === allowedFrontendOrigin) {
		res.setHeader('Access-Control-Allow-Origin',origin)
		res.setHeader('Access-Control-Allow-Credentials','true')
		res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS')
		res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
		res.setHeader('Vary','Origin')
		if (req.method === 'OPTIONS') return res.sendStatus(204)
	}
	next()
})

app.use(express.json());

app.use("/api/v1/auth",authRoutes.getRouter());
app.use("/api/v1",chatRoutes.getRouter());
app.use((error,req,res,next)=>{
	if (res.headersSent) return next(error)
	console.error('Request failed:',error)
	const status = Number.isInteger(error.status) && error.status >= 400 ? error.status : 500
	return res.status(status).json({message:status === 401 ? 'Not authorized' : 'Request failed'})
})


export default app