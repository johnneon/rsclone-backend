import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';

const CreateUser = async ({ password, email, fullName }) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  return await User
    .create({ email, password: hashedPassword, fullName })
    .then(() => {
      return { message: 'User created!' };
    })
    .catch(() => {
      return { message: 'This user has been registered!' };
    });
}

const SignIn = async ({ email }): Promise<IUser> => {
  const user: IUser = await User.findOne({ email }).populate('boards');

  if (user) {
    user.userId = user._id;
  
    const secret = process.env.JWT_SECRET || 'protectedone';
  
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    user.token = token;

    user.boards.map((board: IBoard) => {
      board.columns = undefined;
      board.users = undefined;
    });
  
    return user;
  }
}

export default {
  CreateUser,
  SignIn
};