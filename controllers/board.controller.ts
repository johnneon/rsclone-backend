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
    const { name, user, background } = req.body;

    const check = FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: INCORECT_CHARTS });
    }
  
    const board: IBoard =  await Board
      .create({ name, users: [user.userId], background })
      .then( async (data: IBoard) => {
        await User.updateOne({ _id: user.userId }, {'$push' : {'boards': data._id} });
        return data;
      })
      .catch((err) => err);

    return res.status(201).json(board);
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
    const { userId } = req.body.user;

    const boards: Array<IBoard> = await Board.find({ users: { $in: [ userId ] } });

    boards.map((board) => {
      board.users = undefined;
      board.columns = undefined;
    });

    return res.status(201).json(boards);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const UpdateBoard = async (req: Request, res: Response) => {
  try {
    const { name, background } = req.body;
    const _id = req.params.id;

    const board: IBoard = await Board.findById(_id);

    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }

    if (name) {
      board.name = name;
    }

    if (background) {
      board.background = background;
    }

    board.save();

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
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
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }
  
    await User.updateOne(
      { _id: userId },
      { $pull: { boards: _id } }
    );

    return res.status(201).json({ message: LEFT_BOARD });
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

    return res.status(201).json({ message: "User will get invite!" });
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
    
    return res.status(201).json({ message: "Welcome to our board!" });
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

    return res.status(201).json({ message: "Notification has been daleted!" });
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