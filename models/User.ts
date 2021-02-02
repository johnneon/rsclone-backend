import { Schema, model, Types, Document } from 'mongoose';

interface Invite {
  from: string;
  to: string;
  board: string;
}
export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  boards: Array<object>;
  notifications: Array<Invite>;
  token?: string;
  refreshToken?: string;
  userId?: string;
  _id?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  boards: [{ type: Types.ObjectId, ref: 'Board' }],
  notifications: { type: Object }
}, {
  versionKey: false
});

export default model<IUser>('User', UserSchema);