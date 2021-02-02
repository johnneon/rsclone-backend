import { Request, Response } from 'express';
import Column, { IColumn } from './../models/Column';
import Board, { IBoard } from './../models/Board';
import Card from '../models/Card';
import global from '../variables';

const {
  FORBIDDEN_SYMBOLS_REGEXP,
  INCORECT_CHARTS,
  RANDOM_ERROR,
  BOARD_NOT_FOUND,
  COLUMN_NOT_FOUND,
  INCORECT_POSITION,
  DELETED_COLUMN
} = global;

const CreateColumn = async (req: Request, res: Response) => {
  try {
    const { name, boardId } = req.body;

    const check = FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: INCORECT_CHARTS });
    }
  
    if (!boardId) {
      return res.status(404).json({ message: BOARD_NOT_FOUND });
    }
  
    const column =  await Column
      .create({ name, boardId })
      .then( async (column: IColumn) => {
        await Board.updateOne( { _id: boardId }, { $push: { columns: column._id } });
        return column;
      })
      .catch((err) => err);

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
}

const GetColumn = async (req: Request, res: Response) => {
  try {
    const column: IColumn = await Column.findById(req.params.id).populate('cards');

    if (!column) {
      return res.status(404).json({ message: COLUMN_NOT_FOUND });
    }

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const UpdateColumn = async (req: Request, res: Response) => {
  try {
    const { name, position } = req.body;
    const { id } = req.params;

    if (name) {
      const check = FORBIDDEN_SYMBOLS_REGEXP;

      if (check.test(name)) {
        return res.status(400).json({ message: INCORECT_CHARTS });
      }
    }

    const column: IColumn = await Column.findById(id);

    if (!column) {
      return res.status(404).json({ message: COLUMN_NOT_FOUND });
    }

    if (name) {
      column.name = name;

      column.save();
    }

    if (position || position === 0) {
      console.log('got here');
      const board: IBoard = await Board.findById(column.boardId);

      if (!board) {
        return res.status(404).json({ message: BOARD_NOT_FOUND });
      }

      if (position > board.columns.length || position < 0) {
        return res.status(400).json({ message: INCORECT_POSITION });
      }

      const pasteColumn = {
        $push: {
          columns: {
             $each: [ id ],
             $position: position
          }
        }
      };

      const deleteColumn = {
        $pull: { columns: id }
      };

      const boardId = { _id: column.boardId };

      await Board.findOneAndUpdate(boardId, deleteColumn).catch((e) => e);

      await Board.findOneAndUpdate(boardId, pasteColumn).catch((e) => e);
      
    }

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const DeleteColumn = async (req: Request, res: Response) => {
  try {
    const column: IColumn = await Column.findByIdAndDelete(req.params.id);

    if (!column) {
      return res.status(400).json({ message: COLUMN_NOT_FOUND });
    }

    await Board.updateOne(
      { _id: column.boardId },
      {
        $pull: { columns: column._id }
      }
    );

    await Card.deleteMany({ column: column._id });

    return res.status(201).json({ message: DELETED_COLUMN });
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

export default {
  CreateColumn,
  GetColumn,
  UpdateColumn,
  DeleteColumn,
};