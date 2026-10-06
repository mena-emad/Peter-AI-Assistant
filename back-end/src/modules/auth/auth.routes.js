import { Router } from 'express'
import catchAsync from '../../utils/catchAsync.js'

class AuthRoutes{
    constructor(authController,protect){
        this.authController = authController;
        this.router = Router();
        this.protect = protect;
        this.initRoutes();
    }
    initRoutes(){
        this.router.get('/google',this.authController.auth.bind(this.authController));
        this.router.get('/google/callback',catchAsync(this.authController.callBack.bind(this.authController)));
        this.router.get('/me',this.protect,catchAsync(this.authController.me.bind(this.authController)));
        this.router.post('/refresh',catchAsync(this.authController.refresh.bind(this.authController)));
        this.router.post('/logout',catchAsync(this.authController.logout.bind(this.authController)));
    }

    getRouter(){
        return this.router;
    }
}

export default AuthRoutes