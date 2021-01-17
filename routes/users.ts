import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import { UserType } from '../types/user';
import User from '../models/User';
import { Request, Response } from 'express';
import UserController from '../controllers/user.controller';

const authRouter = Router();

const checkRegister = [
  check('email', 'Incorect email!').isEmail(),
  check('fullName', 'Type of name must be string!').isString(),
  check('password', 'Minimum number of characters 6!').isLength({ min: 6 }),
];

const checkLogin = [
  check('email', 'Incorect email!').isEmail().normalizeEmail(),
  check('password', 'Incorect password!').exists(),
];

authRouter.post('/register', checkRegister, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorect data!',
      });
    }

    const { password, email, fullName } = req.body;

    const answer = await UserController.CreateUser({ password, email, fullName });

    return res.status(201).json(answer);
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

authRouter.post('/login', checkLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorect data!',
      });
    }

    const { email, password } = req.body;

    const user: any = await User.findOne({ email }).populate('boards');

    if (!user) {
      return res.status(400).json({ message: 'Incorect email!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorect password!' })
    }

    const secret = process.env.JWT_SECRET || 'protectedone';

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });

    return res.json({ email, fullName: user.fullName, boards: user.boards, token, userId: user._id });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default authRouter;
