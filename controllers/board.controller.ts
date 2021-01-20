import Board, { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';

const CreateBoard = async ({ name, user }) => {
  return await Board
    .create({ name, users: [user.userId] })
    .then( async (data: IBoard) => {
      await User.updateOne({ _id: user.userId }, {'$push' : {'boards': data._id} });
      return data;
    })
    .catch((err) => err);
}

const GetFullBoard = async ({ id }) => {
  const boardPopulate = {
    path: 'columns',
    populate: {
      path: 'cards'
    }
  }

  const board: IBoard = await Board
    .findById(id)
    .populate(boardPopulate)
    .populate('users');

  if (board) {
    const { users } = board;

    users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
    });
    return board;
  }
};

const GetAllBoards = async ({ userId }) => {
  const boards: any = await Board.find({ users: { $in: [ userId ] } });

  boards.map((board) => {
    board.users = undefined;
    board.columns = undefined;
  });

  return boards;
};

const UpdateBoard = async ({ name, _id}) => {
  const board: IBoard = await Board.findOneAndUpdate({ _id }, { name });

  if (board) {
    const updatedBoard: IBoard = await Board.findById({ _id });
      
    updatedBoard.users = undefined;
    updatedBoard.columns = undefined;

    return updatedBoard;
  }
};

const DeleteBoard = async ({ _id, userId }) => {
  const board: IBoard = await Board.findOne({ _id }, async (err, Board) => {
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

  if (board) {
    await User.updateOne(
      { _id: userId },
      { $pull: { boards: _id } }
    );
    return board;
  }
};

export default {
  CreateBoard,
  GetFullBoard,
  GetAllBoards,
  UpdateBoard,
  DeleteBoard
};