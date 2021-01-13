import { Router } from 'express';
import Board from '../models/Board';
import User from '../models/User';
import auth from '../middleware/auth.middleware';

const boardRouter = Router();

boardRouter.post('/create', auth, async (req, res, next) => {
  try {
    const { name, user } = req.body;

    const check = /^.*?(?=[\^#%&$\*:<>\?/\{\|\}]).*$/g;

    if (check.test(name)) {
      return res.status(400).json({ message: 'The name can not contain invalid characters!' });
    }

    const board = new Board({ name, users: [user.userId] });

    await User.updateOne({ _id: user.userId }, {'$push' : {'boards': board._id} });

    board.save();

    return res.status(201).json({ board });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

boardRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const board: any = await Board.findById(req.params.id).populate('users');

    if (!board) {
      return res.status(404).json({ message: 'Can not find board!' }); 
    }

    if (board) {
      const { users } = board;

      users.map((el) => el.password = undefined);
    }

    return res.status(201).json({ board });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

boardRouter.put('/:id', auth, async (req, res, next) => {
  try {
    const { name } = req.body;
    const board: any = await Board.updateOne({ _id: req.params.id}, { name });

    const newBoard: any = await Board.findById(req.params.id).populate('users');

    if (newBoard) {
      const { users } = board;

      users.map((el) => el.password = undefined);
    }

    return res.status(201).json({ newBoard });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

boardRouter.delete('/:id', auth, async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.body.user.userId },
      { $pull: { boards: req.params.id } }
    );

    await Board.updateOne(
      { _id: req.params.id },
      { $pull: { users: req.body.user.userId } }
    );

    await Board.findOne({ _id: req.params.id }, (err, Board) => {
      if (err) {
        throw err;
      }

      if (Board.users.length === 0) {
        Board.delete();
      }
    });

    return res.status(201).json({ message: 'You have successfully left the board!' });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default boardRouter;
