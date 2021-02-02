import { Errback, Request, Response } from 'express';
import Board, { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';
import global from '../variables';

const {
  FORBIDDEN_SYMBOLS_REGEXP,
  INCORECT_CHARTS,
  RANDOM_ERROR,
  BOARD_NOT_FOUND,
  LEFT_BOARD,
  USER_NOT_FOUND,
  INCORECT_DATA
} = global;

const CreateBoard = async (req: Request, res: Response) => {
  try {
    const { name, user } = req.body;
  
    const check = FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: INCORECT_CHARTS });
    }
  
    const board: IBoard =  await Board
      .create({ name, users: [user.userId] })
      .then( async (data: IBoard) => {
        await User.updateOne({ _id: user.userId }, {'$push' : {'boards': data._id} });
        return data;
      })
      .catch((err) => err);

    const { notifications } = req.body.user;
    const response = { data: board, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
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
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }
  
    const { users } = board;
  
    users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
    });

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
  
};

const GetAllBoards = async (req: Request, res: Response) => {
  try {
    const { userId, notifications } = req.body.user;

    const boards: Array<IBoard> = await Board.find({ users: { $in: [ userId ] } });

    boards.map((board) => {
      board.users = undefined;
      board.columns = undefined;
    });

    const response = { data: boards, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const UpdateBoard = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const _id = req.params.id;

    const board: IBoard = await Board.findOneAndUpdate({ _id }, { name });
    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }

    const updatedBoard: IBoard = await Board.findById({ _id });
      
    updatedBoard.users = undefined;
    updatedBoard.columns = undefined;

    const { notifications } = req.body.user;
    const response = { data: updatedBoard, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const DeleteBoard = async (req: Request, res: Response) => {
  try {
    const { userId, notifications } = req.body.user;
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
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }
  
    await User.updateOne(
      { _id: userId },
      { $pull: { boards: _id } }
    );

    const response = { data: { message: LEFT_BOARD }, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const InviteUser = async (req: Request, res: Response) => {
  try {
    const { from, to, board } = req.body;

    if (!from || !to || !board) {
      return res.status(400).json({ message: INCORECT_DATA });
    }

    const user =  await User.findOneAndUpdate({ email: to }, {
      $push: { notifications: { from, to, board } }
    });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const { notifications } = req.body.user;
    const response = { data: { message: "User will get invite!" }, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const AcceptInvite = async (req: Request, res: Response) => {
  try {
    const { userId, notifications } = req.body.user;
    const id = req.params.id;

    const user =  await User.findByIdAndUpdate(userId, {
      $pull: { notifications: { board: id } },
      $push: { boards: id }
    });

    const board = await Board.findByIdAndUpdate(id, {
      $push: { users: userId }
    });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }
    
    const response = { data: { message: "Welcome to our board!" }, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const IgnoreInvite = async (req: Request, res: Response) => {
  try {
    const { userId, notifications } = req.body.user;
    const id = req.params.id;

    const user =  await User.findByIdAndUpdate(userId, {
      $pull: { notifications: { board: id } },
      $push: { boards: id }
    });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const response = { data: { message: "Notification has been daleted!" }, notifications };

    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

export default {
  CreateBoard,
  GetFullBoard,
  GetAllBoards,
  UpdateBoard,
  DeleteBoard,
  InviteUser,
  AcceptInvite,
  IgnoreInvite
};