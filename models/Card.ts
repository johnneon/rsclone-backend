import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  column: { type: String },
  board: { type: Types.ObjectId, ref: 'Board' },
  content: { type: String }
});

export default model('Card', schema);