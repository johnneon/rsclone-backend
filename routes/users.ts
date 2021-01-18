import { Router } from 'express';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { IUser } from './../models/User';
import UserController from '../controllers/user.controller';
import bcrypt = require('bcrypt');
import checkMiddleware from '../middleware/check.middleware';
import global from '../variables';

const authRouter = Router();

authRouter.post('/register', checkMiddleware.checkRegister, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: global.INCORECT_DATA,
      });
    }

    const { password, email, fullName } = req.body;

    const answer = await UserController.CreateUser({ password, email, fullName });

    return res.status(201).json(answer);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

authRouter.post('/login', checkMiddleware.checkLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: global.INCORECT_DATA,
      });
    }

    const { email, password } = req.body;

    const user: IUser = await UserController.SignIn({ email });

    if (!user) {
      return res.status(404).json({ message: global.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: global.INCORECT_PASS });
    }

    return res.json({
      email: user.email,
      fullName: user.fullName,
      boards: user.boards,
      token: user.token,
      userId: user._id
    });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

export default authRouter;
