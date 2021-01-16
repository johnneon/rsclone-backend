import { Router } from 'express';
import Board from '../models/Board';
import Column from '../models/Column';
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
    const boardPopulate = {
      path: 'columns',
      populate: {
        path: 'cards'
      }
    }
    const board: any = await Board.findById(req.params.id).populate(boardPopulate);

    if (!board) {
      return res.status(404).json({ message: 'Can not find board!' }); 
    }

    if (board) {
      const { users } = board;

      users.map((el) => {
        el.password = undefined;
        el.boards = undefined;
        el.__v = undefined;
      });
    }

    return res.status(201).json({ board });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

boardRouter.put('/rename/:id', auth, async (req, res, next) => {
  try {
    const { name } = req.body;

    const board: any = await Board.updateOne({ _id: req.params.id}, { name });

    if (!board) {
      return res.status(404).json({ message: 'Can not find board!' }); 
    }
    
    const newBoard: any = await Board.findById(req.params.id).populate('users');
    
    if (newBoard) {
      const { users } = newBoard;
      
      users.map((el) => {
        el.password = undefined;
        el.boards = undefined;
        el.__v = undefined;
      });
    }

    return res.status(201).json({ newBoard });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

boardRouter.delete('/:id', auth, async (req, res, next) => {
  try {
    const board: any = await Board.findOne({ _id: req.params.id }, async (err, Board) => {
      if (err) {
        throw err;
      }

      if (Board.users.length === 0) {
        Board.delete();
      }
    });

    if (!board) {
      return res.status(404).json({ message: 'Can not find board!' }); 
    }

    await User.updateOne(
      { _id: req.body.user.userId },
      { $pull: { boards: req.params.id } }
    );

    return res.status(201).json({ message: 'You have successfully left the board!' });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default boardRouter;
