import mongoose, { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  boards: [{ type: Types.ObjectId, ref: 'Board' }]
});

export default model('User', schema);