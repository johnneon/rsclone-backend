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
  columnId: { type: Types.ObjectId, ref: 'Column' },
  content: { type: String }
}, {
  versionKey: false
});

export default model<ICard>('Card', CardSchema);