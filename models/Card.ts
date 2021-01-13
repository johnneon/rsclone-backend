import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  data: {
    board: [{ type: Types.ObjectId, ref: 'Board' }],
    decription: { type: String }
  }
});

export default model('Board', schema);