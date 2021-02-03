import { Schema, model, Types, Document } from 'mongoose';
import { IUser } from './User';
import { IColumn } from './Column';

export interface Label {
  color: string;
  name: string;
}

export interface ICard extends Document {
  name: string;
  position: number;
  columnId: string;
  content?: string;
  labels: Array<Label>;
  users?: Array<IUser | string>;
}

const CardSchema: Schema = new Schema({
  name: { type: String, required: true },
  columnId: { type: Types.ObjectId, ref: 'Column' },
  content: { type: String },
  labels: [{ type: Object }],
  users: [{ type: Types.ObjectId, ref: 'User' }]
}, {
  versionKey: false
});

export default model<ICard>('Card', CardSchema);