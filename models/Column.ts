import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true, unique: false },
  position: { type: Number, default: 0, unique: false },
  boardId: { type: Types.ObjectId, ref: 'Board' },
  cards: [{type: Types.ObjectId, ref: 'Card'}]
});

export default model('Column', schema);