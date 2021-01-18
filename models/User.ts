import { IBoard } from './Board';
import { Schema, model, Types, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  boards: Array<object>;
  token?: string;
  userId?: string;
  _id?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  boards: [{ type: Types.ObjectId, ref: 'Board' }]
}, {
  versionKey: false
});

export default model<IUser>('User', UserSchema);