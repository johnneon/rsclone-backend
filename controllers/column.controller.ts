import Column, { IColumn } from './../models/Column';
import Board, { IBoard } from './../models/Board';
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
      const columns = await Column.find({ boardId: column.boardId });
      columns.sort((a, b) => a.position - b.position);

      const currentPos = column.position;
      const desiredPos = position;
      const operation = columns.splice(currentPos, 1);
      columns.splice(desiredPos, 0, ...operation);
      columns.forEach((el, ind) => el.position = ind );
    
      const bulkArr = [];
    
      for (const input of columns) {
        bulkArr.push({
          updateOne: {
            filter: { _id: input._id },
            update: { position: input.position }
          }
        });
      }
    
      await Column.bulkWrite(bulkArr);

      column.position = position;
    }

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