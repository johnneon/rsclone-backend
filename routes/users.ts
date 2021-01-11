import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import User from '../models/User';

const authRouter = Router();

const checkRegister = [
  check('email', 'Incorect email!').isEmail(),
  check('password', 'Minimum number of characters 6!').isLength({ min: 6 }),
];

const checkLogin = [
  check('email', 'Incorect email!').isEmail().normalizeEmail(),
  check('password', 'Incorect password!').exists(),
];

authRouter.post('/register', checkRegister, async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorect data!',
      });
    }

    const { password, email, fullName } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      return res.status(400).json({ message: 'This user has been registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ email, password: hashedPassword, fullName });

    await user.save();

    return res.status(201).json({ message: 'User created!' });
  } catch (e) {
    res.status(500).json({ message: 'Got an error!' });
  }
});

authRouter.post('/login', checkLogin, async (req, res, next) => {
  try {
    const errors: any = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    const user: any = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Incorect email!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorect password!' })
    }

    const secret = process.env.JWT_SECRET || 'protectedone';

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });

    res.json({ token, userId: user._id });
  } catch (e) {
    res.status(500).json({ message: 'Got an error!' });
  }
});

export default authRouter;
