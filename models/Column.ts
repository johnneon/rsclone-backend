import { Schema, model, Types, Document } from 'mongoose';
export interface IColumn extends Document {
  name: string;
  position: number;
  boardId: string;
  cards: Array<object>;
}

const ColumnSchema: Schema = new Schema({
  name: { type: String, required: true, unique: false },
  boardId: { type: Types.ObjectId, ref: 'Board' },
  cards: [{type: Types.ObjectId, ref: 'Card'}]
}, {
  versionKey: false
});

export default model<IColumn>('Column', ColumnSchema);