import { Schema, model, Types, Document } from 'mongoose';
import { IColumn } from './Column';
import { IUser } from './User';

export interface Label {
  color: string;
  name: string;
}

export interface IBoard extends Document {
  name: string;
  users: Array<IUser['_id'] | object>;
  columns: Array<IColumn | string>;
  labels: Array<Label>;
  boardId?: string;
  background?: string;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  users: [{ type: Types.ObjectId, ref: 'User' }],
  columns: [{ type: Types.ObjectId, ref: 'Column' }],
  background: { type: String },
  labels: [{ type: Object }],
}, {
  versionKey: false
});

export default model<IBoard>('Board', BoardSchema);