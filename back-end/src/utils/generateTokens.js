import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'

export function generateAt(userId){
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
    return accessToken
}

export function generateRt(userId){
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d',jwtid:randomUUID()});
    return refreshToken
}