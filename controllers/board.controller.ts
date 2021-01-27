import { Errback, Request, Response } from 'express';
import Board, { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';
import global from '../variables';

const CreateBoard = async (req: Request, res: Response) => {
  try {
    const { name, user } = req.body;
  
    const check = global.FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: global.INCORECT_CHARTS });
    }
  
    const board: IBoard =  await Board
      .create({ name, users: [user.userId] })
      .then( async (data: IBoard) => {
        await User.updateOne({ _id: user.userId }, {'$push' : {'boards': data._id} });
        return data;
      })
      .catch((err) => err);
  
    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
}

const GetFullBoard = async (req: Request, res: Response) => {
  try {
    const boardPopulate = {
      path: 'columns',
      populate: {
        path: 'cards'
      }
    }
  
    const board: IBoard = await Board
      .findById(req.params.id)
      .populate(boardPopulate)
      .populate('users');

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }
  
    const { users } = board;
  
    users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
    });

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
  
};

const GetAllBoards = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user;

    const boards: any = await Board.find({ users: { $in: [ userId ] } });

    boards.map((board) => {
      board.users = undefined;
      board.columns = undefined;
    });

    return res.status(201).json(boards);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

const UpdateBoard = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const _id = req.params.id;

    const board: IBoard = await Board.findOneAndUpdate({ _id }, { name });
    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    const updatedBoard: IBoard = await Board.findById({ _id });
      
    updatedBoard.users = undefined;
    updatedBoard.columns = undefined;

    return res.status(201).json(updatedBoard);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

const DeleteBoard = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user;
    const _id = req.params.id;
    
    const board: IBoard = await Board.findOne({ _id }, async (err: Errback, Board: IBoard) => {
      if (err) {
        throw err;
      }
  
      const { users } = Board;
  
      const user = users.indexOf(userId);
  
      if (user !== -1) {
        users.splice(user, 1);
      }
  
      if (Board.users.length === 0) {
        Board.delete();
      }
    });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }
  
    await User.updateOne(
      { _id: userId },
      { $pull: { boards: _id } }
    );

    return res.status(201).json({ message: global.LEFT_BOARD });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

export default {
  CreateBoard,
  GetFullBoard,
  GetAllBoards,
  UpdateBoard,
  DeleteBoard
};