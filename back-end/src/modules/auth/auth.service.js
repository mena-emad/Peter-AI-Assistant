import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { google } from 'googleapis'
import { generateRt, generateAt } from '../../utils/generateTokens.js'

const refreshLifetimeMs = 7 * 24 * 60 * 60 * 1000

function hashToken(token){
    return createHash('sha256').update(token).digest('hex')
}

function publicUser(user){
    return {_id:String(user._id),name:user.name,email:user.email}
}

class AuthService{
    constructor(authRepository,googleClient){
        this.authRepository = authRepository;
        this.googleClient = googleClient
    }

    async auth(code){
        const {tokens} = await this.googleClient.getToken(code)
        this.googleClient.setCredentials(tokens)
        const oauth2 = google.oauth2({auth:this.googleClient,version:'v2'})
        const {data} = await oauth2.userinfo.get()
        if(!data.email || data.verified_email === false) throw new Error('Google account email is not verified')

        const googleUser = {
            googleId:data.id,
            name:data.name,
            email:data.email
        }

        let user = await this.authRepository.findByEmail(googleUser.email)
        if(!user) user = await this.authRepository.create(googleUser)

        const userId = String(user._id)
        const accessToken = generateAt(userId)
        const refreshToken = generateRt(userId)
        const expiresAt = new Date(Date.now() + refreshLifetimeMs)
        await this.authRepository.saveSession({
            userId,
            refreshTokenHash:hashToken(refreshToken),
            expiresAt,
        })
        
        return {user:publicUser(user),accessToken,refreshToken}
    }

    async getCurrentUser(userId){
        const user = await this.authRepository.findById(userId)
        return user ? publicUser(user) : null
    }

    async refresh(refreshToken){
        if(!refreshToken) throw new Error('Refresh token is missing')
        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        if(!decoded.userId) throw new Error('Refresh token is invalid')

        const userId = String(decoded.userId)
        const storedSession = await this.authRepository.findSession(userId,hashToken(refreshToken))
        if(!storedSession) throw new Error('Refresh session is invalid')

        const user = await this.authRepository.findById(userId)
        if(!user) throw new Error('User is unavailable')

        const accessToken = generateAt(userId)
        const nextRefreshToken = generateRt(userId)
        await this.authRepository.saveSession({
            userId,
            refreshTokenHash:hashToken(nextRefreshToken),
            expiresAt:new Date(Date.now() + refreshLifetimeMs),
        })

        return {user:publicUser(user),accessToken,refreshToken:nextRefreshToken}
    }

    async logout(refreshToken){
        if(!refreshToken) return
        try{
            const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
            if(decoded.userId){
                await this.authRepository.deleteSession(String(decoded.userId),hashToken(refreshToken))
            }
        }catch{
            return
        }
    }
}

export default AuthService