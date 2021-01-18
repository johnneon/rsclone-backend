import Board, { IBoard } from '../models/Board';
import { Request, Response, Router } from 'express';
import User, { IUser } from '../models/User';
import auth from '../middleware/auth.middleware';
import global from '../variables';
import BoardController from '../controllers/board.controller';

const boardRouter = Router();

boardRouter.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const check = global.FORBIDDEN_SYMBOLS_REGEXP;

    if (check.test(name)) {
      return res.status(400).json({ message: global.INCORECT_CHARTS });
    }

    const board: Promise<IBoard> = await BoardController.CreateBoard({ ...req.body });

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const board: IBoard = await BoardController.GetFullBoard({ id: req.params.id });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.get('/all/:id', auth, async (req: Request, res: Response) => {
  try {
    const board: any = await Board.find({ users: { $in: [req.params.id] } });
    console.log(board);

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    board.users = undefined;

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const board: IBoard = await Board.updateOne({ _id: req.params.id}, { name });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }
    
    const newBoard: IBoard = await Board.findById(req.params.id).populate('users');
    
    if (newBoard) {
      const { users } = newBoard;
      
      users.map((user: IUser) => {
        user.password = undefined;
        user.boards = undefined;
      });
    }

    return res.status(201).json({ newBoard });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const board: IBoard = await Board.findOne({ _id: req.params.id }, async (err, Board) => {
      if (err) {
        throw err;
      }

      if (Board.users.length === 0) {
        Board.delete();
      }
    });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    await User.updateOne(
      { _id: req.body.user.userId },
      { $pull: { boards: req.params.id } }
    );

    return res.status(201).json({ message: global.LEFT_BOARD });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

export default boardRouter;
