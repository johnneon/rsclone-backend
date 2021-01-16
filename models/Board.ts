import { Schema, model, Types } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true, unique: false },
  users: [{ type: Types.ObjectId, ref: 'User' }],
  columns: [{ type: Types.ObjectId, ref: 'Column' }]
});

export default model('Board', schema);