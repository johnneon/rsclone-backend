import { Schema, model, Types, Document } from 'mongoose';
import { IColumn } from './Column';

export interface ICard extends Document {
  name: string;
  position: number;
  column: IColumn['_id'];
  content: string;
}

const CardSchema: Schema = new Schema({
  name: { type: String, required: true },
  position: { type: Number, default: 0 },
  column: { type: Types.ObjectId, ref: 'Column' },
  content: { type: String }
}, {
  versionKey: false
});

export default model<ICard>('Card', CardSchema);