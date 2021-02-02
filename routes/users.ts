import { Router } from 'express';
import AuthController from '../controllers/user.controller';
import checkMiddleware from '../middleware/check.middleware';
import auth from '../middleware/auth.middleware';

const authRouter = Router();

authRouter.post('/register', checkMiddleware.checkRegister, AuthController.CreateUser);

authRouter.get('/get_user', auth, AuthController.GetUserData);

authRouter.post('/login', checkMiddleware.checkLogin, AuthController.SignIn);

authRouter.post('/refresh_token', checkMiddleware.checkLogin, AuthController.GetNewToken);

authRouter.delete('/logout', checkMiddleware.checkLogin, AuthController.LogOut);

export default authRouter;
