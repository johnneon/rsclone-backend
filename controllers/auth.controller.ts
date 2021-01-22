import { Request, Response } from 'express';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import { IBoard } from '../models/Board';
import User, { IUser } from '../models/User';
import RefreshToken, { IToken } from '../models/RefreshToken';
import { validationResult } from 'express-validator';
import global from '../variables';

const CreateUser = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
  
      if (!(errors.isEmpty())) {
        return res.status(400).json({
          errors: errors.array(),
          message: global.INCORECT_DATA,
        });
      }

      const { email, fullName, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 12);

      const user =  await User
        .create({ email, password: hashedPassword, fullName })
        .then(() => {
          return { message: 'User created!' };
        })
        .catch(() => {
          return { message: 'This user has been registered!' };
        });
      
      if (user) {
        return res.status(201).json(user);
      }
    } catch (e) {
      return res.status(500).json({ message: global.RANDOM_ERROR });
    }
}

const SignIn = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!(errors.isEmpty())) {
      return res.status(400).json({
        errors: errors.array(),
        message: global.INCORECT_DATA,
      });
    }

    const { email, password } = req.body;

    const user: IUser = await User.findOne({ email }).populate('boards');

    if (!user) {
      return res.status(404).json({ message: global.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: global.INCORECT_PASS });
    }

    user.userId = user._id;

    await RefreshToken.findOneAndDelete({ email }); // прочекать !!!

    const secret = process.env.JWT_SECRET || 'protectedone';
    const refreshSecret = process.env.REFRESH_JWT_SECRET || 'protecteuptodate';
    
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ userId: user._id }, refreshSecret, { expiresIn: '1d' });

    await RefreshToken.create({ email, refreshToken });

    user.refreshToken = refreshToken;
    user.token = token;

    user.boards.map((board: IBoard) => {
      board.columns = undefined;
      board.users = undefined;
    });

    return res.json({
      email: user.email,
      fullName: user.fullName,
      boards: user.boards,
      token: user.token,
      refreshToken: user.refreshToken,
      userId: user._id
    });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
}

const GetNewToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(403).json({ error: "Access denied,token missing!" });
    }

    const token: IToken = await RefreshToken.findOne({ refreshToken });

    if (!token) {
      return res.status(401).json({ error: "Token expired!" });
    }

    const secret = process.env.JWT_SECRET || 'protectedone';
    const refreshSecret = process.env.REFRESH_JWT_SECRET || 'protecteuptodate';

    const payload = jwt.verify(token.refreshToken, refreshSecret);

    if (!payload) {

    }

    const accessToken = jwt.sign({ userId: payload['userId'] }, secret, { expiresIn: '10m' });

    return res.status(200).json({ token: accessToken });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

const LogOut = async (req: Request, res: Response) => {};

export default {
  CreateUser,
  SignIn,
  GetNewToken,
  LogOut
};