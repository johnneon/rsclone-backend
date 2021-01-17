import { Schema, model, Types, Document } from 'mongoose';
import { ICard } from './Card';

export interface IColumn extends Document {
  name: string;
  position: number;
  boardId: string;
  cards: Array<string>;
}

const ColumnSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  position: { type: Number, default: 0, unique: false },
  boardId: { type: Types.ObjectId, ref: 'Board' },
  cards: [{type: Types.ObjectId, ref: 'Card'}]
}, {
  versionKey: false
});

export default model<IColumn>('Column', ColumnSchema);