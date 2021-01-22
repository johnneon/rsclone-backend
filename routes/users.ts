import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import checkMiddleware from '../middleware/check.middleware';

const authRouter = Router();

authRouter.post('/register', checkMiddleware.checkRegister, AuthController.CreateUser);

authRouter.post('/login', checkMiddleware.checkLogin, AuthController.SignIn);

authRouter.post('/refresh_token', checkMiddleware.checkLogin, AuthController.GetNewToken);

authRouter.delete('/logout', checkMiddleware.checkLogin, AuthController.LogOut);

export default authRouter;
