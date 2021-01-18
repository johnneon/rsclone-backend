import Board, { IBoard } from './../models/Board';
import User, { IUser } from '../models/User';
import global from '../variables';

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

  const board: IBoard = await Board.findById(id).populate(boardPopulate);

  if (board) {
    const { users } = board;

    users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
    });
    return board;
  }
};

const UpdateBoard = async ({}) => {};

const DeleteBoard = async ({}) => {};

export default {
  CreateBoard,
  GetFullBoard,
  UpdateBoard,
  DeleteBoard
};