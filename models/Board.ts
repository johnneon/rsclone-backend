import { Schema, model, Types, Document } from 'mongoose';
import { IColumn } from './Column';
import { IUser } from './User';

export interface IBoard extends Document {
  name: string;
  users: Array<IUser['_id'] | object>;
  columns: Array<string>;
  boardId?: string;
  background?: Object;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  users: [{ type: Types.ObjectId, ref: 'User' }],
  columns: [{ type: Types.ObjectId, ref: 'Column' }],
  background: { type: Object }
}, {
  versionKey: false
});

export default model<IBoard>('Board', BoardSchema);