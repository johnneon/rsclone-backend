import { Schema, model, Types, Document } from 'mongoose';

export interface IToken extends Document {
  email: string;
  refreshToken: string;
}

const RefreshToken: Schema = new Schema({
  userId: { type: String, required: true, unique: false },
  refreshToken: { type: String, required: true, unique: false },
}, {
  versionKey: false
});

export default model<IToken>('RefreshToken', RefreshToken);