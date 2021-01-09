import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { UserType } from '../types/user';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import getCollection from '../storage/mongo';
import { v4 as uuid } from 'uuid';

const authRouter = Router();

const checkRegister = [
  check('email', 'Incorect email!').isEmail().normalizeEmail(),
  check('password', 'Minimum number of characters 6!').isLength({ min: 6 })
];

authRouter.post('/register', checkRegister, async (req, res, next) => {
  try {
    const errors = validationResult(req);

    const { password, email, login } = req.body;


    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorect data!',
      });
    }

    const collection = await getCollection('users');

    const candidate = await collection.findOne({ email });

    if (candidate) {
      return res.status(400).json({ message: 'This user has been registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuid();

    const user: UserType = {
      email: email,
      password: hashedPassword,
      login: login,
      id: id,
    };

    await collection.insertOne(user);

    return res.status(201).json({ message: 'User created!' });
  } catch (e) {
    res.status(500).json({ message: 'Got an error!' });
  }
});

authRouter.post('/login', (req, res, next) => {
  res.send('respond with a resource');
});

export default authRouter;
