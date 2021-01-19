import { Schema, model, Types, Document } from 'mongoose';
import { IColumn } from './Column';

export interface ICard extends Document {
  name: string;
  position: number;
  columnId: IColumn['_id'];
  content: string;
}

const CardSchema: Schema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  columnId: { type: Types.ObjectId, ref: 'Column' },
  content: { type: String }
}, {
  versionKey: false
});

export default model<ICard>('Card', CardSchema);