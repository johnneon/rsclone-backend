import { Label } from './../models/Card';
import { IColumn } from './../models/Column';
import { Errback, Request, Response } from 'express';
import Board, { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';
import global from '../variables';
import { ICard } from '../models/Card';

const {
  FORBIDDEN_SYMBOLS_REGEXP,
  INCORECT_CHARTS,
  RANDOM_ERROR,
  BOARD_NOT_FOUND,
  LEFT_BOARD,
  USER_NOT_FOUND,
  INCORECT_DATA,
  USER_INVITED,
  NOT_DELETED,
  WELCOME_BOARD,
  WILL_GET_INVITE
} = global;

const CreateBoard = async (req: Request, res: Response) => {
  try {
    const { name, user, background } = req.body;

    const check = FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: INCORECT_CHARTS });
    }

    const labels = [
      { color: '#ef5350', textColor: '#fff', name: '' },
      { color: '#9c27b0', textColor: '#fff', name: '' },
      { color: '#2196f3', textColor: '#fff', name: '' },
      { color: '#3f51b5', textColor: '#fff', name: '' },
      { color: '#ff5722', textColor: '#fff', name: '' },
      { color: '#009688', textColor: '#fff', name: '' },
      { color: '#00bcd4', textColor: '#000', name: '' },
      { color: '#8bc34a', textColor: '#000', name: '' },
      { color: '#cddc39', textColor: '#000', name: '' },
      { color: '#4caf50', textColor: '#000', name: '' },
      { color: '#ffeb3b', textColor: '#000', name: '' },
      { color: '#ffc107', textColor: '#000', name: '' },
      { color: '#ff9800', textColor: '#000', name: '' },
    ];
  
    const board: IBoard =  await Board
      .create({ name, users: [user.userId], background, labels })
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
        path: 'cards',
        populate: {
          path: 'users'
        }
      }
    }
  
    const board: IBoard = await Board
      .findById(req.params.id)
      .populate(boardPopulate)
      .populate('users');

    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }
  
    const { users, columns, labels } = board;

    columns.map((column: IColumn) => {
      column.cards.map((card: ICard) => {
        card.labels.forEach((label: Label) => {
          label.name = labels.find((el) => el.color === label.color).name;
        });
        card.users.map((user: IUser) => {
          user.password = undefined;
          user.boards = undefined;
          user.notifications = undefined;
        });
      });
    });
  
    users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
      user.notifications = undefined;
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
    const { name, background, label } = req.body;
    const _id = req.params.id;

    const board: IBoard = await Board.findById(_id);

    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND }); 
    }

    if (name) {
      board.name = name;
    }

    if (label) {
      console.log(label);
      const labelIndex = board.labels.findIndex((el) => el.color === label.color);

      board.labels.splice(labelIndex, 1, label);
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

      Board.save();
  
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
    const { from, to, boardId } = req.body;

    const board = await Board.findById(boardId);

    if (!from || !to || !board) {
      return res.status(400).json({ message: INCORECT_DATA });
    }

    const user: IUser =  await User.findOne({ email: to });

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    if (user.notifications) {
      const checkBoards = user.boards.findIndex((el) => el.toString() === boardId.toString());
      const checkInvites = user.notifications.findIndex((el) => el.boardId === boardId);

      if (!(checkBoards === -1) || !(checkInvites === -1)) {
        return res.status(400).json({ message: USER_INVITED });
      }
    }

    await User.findOneAndUpdate({ email: to }, {
      $push: { notifications: { from, to, boardId, boardName: board.name } }
    });

    return res.status(201).json({ message: WILL_GET_INVITE });
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const AcceptInvite = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user;
    const id = req.params.id;

    const board: IBoard =  await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND });
    }

    const checkUsers = board.users.findIndex((el) => el.toString() === userId.toString());
    
    if (!(checkUsers === -1)) {
      return res.status(400).json({ message: USER_INVITED });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: { boardId: id } },
      $push: { boards: id }
    });

    await Board.findByIdAndUpdate(id, {
      $push: { users: userId }
    });
    
    return res.status(201).json({ message: WELCOME_BOARD });
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const IgnoreInvite = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user;
    const id = req.params.id;

    const board: IBoard =  await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: BOARD_NOT_FOUND });
    }

    const checkUsers = board.users.findIndex((el) => el.toString() === userId.toString());
    
    if (!(checkUsers === -1)) {
      return res.status(400).json({ message: USER_INVITED });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: { boardId: id } },
      $push: { boards: id }
    });

    return res.status(201).json({ message: NOT_DELETED });
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