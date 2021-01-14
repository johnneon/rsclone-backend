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
    const board: any = await Board.findOne({ _id: req.params.id }, (err, Board) => {
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

boardRouter.put('/create/column/:id', auth, async (req, res, next) => {
  try {
    const { name, position } = req.body;

    await Board.updateOne(
      {
        _id: req.params.id},
        {
          $push: { columns: { name, position } }
        }
    );

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

boardRouter.delete('/delete/column/:id', auth, async (req, res, next) => {
  try {

    const { id } = req.body;

    await Board.updateOne(
      { _id: req.params.id },
      {
        $pull: { columns: { _id: id } }
      }
    );

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

export default boardRouter;
