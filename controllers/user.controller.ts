import User, { IUser } from '../models/User';
import bcrypt = require('bcrypt');

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

export default {
  CreateUser
};