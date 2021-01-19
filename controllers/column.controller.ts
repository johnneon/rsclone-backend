import Column, { IColumn } from './../models/Column';
import Board from './../models/Board';
import Card from '../models/Card';

const CreateColumn = async ({ name, position, boardId }) => {
  return await Column
    .create({ name, position, boardId })
    .then( async (column: IColumn) => {
      await Board.updateOne( { _id: boardId }, { $push: { columns: { _id: column._id } } });
      return column;
    })
    .catch((err) => err);
}

const GetColumn = async ({ id }) => {
  console.log(id);
  const column: IColumn = await Column.findById(id).populate('cards');

  if (column) {
    return column;
  }
};

const UpdateColumn = async ({ id, name, position }) => {
  const column: IColumn = await Column.findById(id);

  if (column) {

    if (name) {
      column.name = name;
    }
    
    if (position || position === 0) {
      column.position = position;
    }

    column.save();

    return column;
  }
};

const DeleteColumn = async ({ id }) => {
  const column: IColumn = await Column.findByIdAndDelete(id);

  if (column) {
    await Board.updateOne(
      { _id: column.boardId },
      {
        $pull: { columns: column._id }
      }
    );
  
    await Card.deleteMany({ column: column._id });
    return column;
  }

};

export default {
  CreateColumn,
  GetColumn,
  UpdateColumn,
  DeleteColumn,
};