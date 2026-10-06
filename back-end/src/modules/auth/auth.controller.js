import { randomBytes, timingSafeEqual } from 'node:crypto'
import googleClient from "../../config/google.js";

function authCookieOptions(maxAge){
    const sameSite = process.env.COOKIE_SAME_SITE || 'lax'
    return {
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production' || sameSite === 'none',
        sameSite,
        path:'/',
        ...(maxAge ? {maxAge} : {}),
    }
}

class AuthController{
    constructor(authService) {
        this.authService = authService;
    }

    auth(req,res){
        const state = randomBytes(32).toString('hex')
        res.cookie('googleOAuthState',state,{...authCookieOptions(10*60*1000),path:'/api/v1/auth/google/callback'})
        const url = googleClient.generateAuthUrl({
            access_type:"offline",
            prompt:"select_account",
            state,
            scope:[
                "openid",
                "email",
                "profile"
            ]
        })

        res.redirect(url);
    }

    async callBack(req,res){
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/,'')
        try{
            const {code,state} = req.query
            const expectedState = req.cookies?.googleOAuthState
            res.clearCookie('googleOAuthState',{...authCookieOptions(),path:'/api/v1/auth/google/callback'})
            const expectedBytes = Buffer.from(expectedState || '')
            const actualBytes = Buffer.from(typeof state === 'string' ? state : '')
            const validState = expectedBytes.length === actualBytes.length && expectedBytes.length > 0 && timingSafeEqual(expectedBytes,actualBytes)
            if(!code || !validState) return res.redirect(`${frontendUrl}/?authError=google`)
            const result = await this.authService.auth(code)
            res.cookie("accessToken",result.accessToken,authCookieOptions(15*60*1000));
            res.cookie("refreshToken",result.refreshToken,authCookieOptions(7*24*60*60*1000));
            res.redirect(frontendUrl)
        }catch(err){
            console.error('Google authentication failed:',err.message)
            res.redirect(`${frontendUrl}/?authError=google`)
        }
    }

    async me(req,res){
        const user = await this.authService.getCurrentUser(req.user.userId)
        if(!user) return res.status(401).json({message:'Not authorized'})
        return res.status(200).json(user)
    }

    async refresh(req,res){
        try{
            const result = await this.authService.refresh(req.cookies?.refreshToken)
            res.cookie("accessToken",result.accessToken,authCookieOptions(15*60*1000));
            res.cookie("refreshToken",result.refreshToken,authCookieOptions(7*24*60*60*1000));
            return res.status(200).json(result.user)
        }catch{
            this.clearAuthCookies(res)
            return res.status(401).json({message:'Not authorized'})
        }
    }

    async logout(req,res){
        await this.authService.logout(req.cookies?.refreshToken)
        this.clearAuthCookies(res)
        return res.status(204).end()
    }

    clearAuthCookies(res){
        const options = authCookieOptions()
        res.clearCookie('accessToken',options)
        res.clearCookie('refreshToken',options)
        res.clearCookie('conversationId',options)
    }

}

export default AuthController