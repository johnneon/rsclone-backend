import { Schema, model, Types, Document } from 'mongoose';
import { IColumn } from './Column';
import { IUser } from './User';

export interface IBoard extends Document {
  name: string;
  users: Array<IUser['_id'] | object>;
  columns: Array<IColumn['_id']>;
  boardId?: string;
}

const BoardSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  users: [{ type: Types.ObjectId, ref: 'User' }],
  columns: [{ type: Types.ObjectId, ref: 'Column' }]
}, {
  versionKey: false
});

export default model<IBoard>('Board', BoardSchema);