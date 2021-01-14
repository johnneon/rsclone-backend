import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true, unique: false },
  users: [{ type: Types.ObjectId, ref: 'User' }],
  columns: [
    {
      name: { type: String },
      position: { type: Number, default: 0 },
      id: { type: String, required: true, unique: true },
      cards: [{ type: Types.ObjectId, ref: 'Card' }]
    }
  ]
});

export default model('Board', schema);