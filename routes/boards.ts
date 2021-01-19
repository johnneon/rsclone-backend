import { IBoard } from '../models/Board';
import { Request, Response, Router } from 'express';
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

boardRouter.get('/', auth, async (req: Request, res: Response) => {
  try {
    const boards: any = await BoardController.GetAllBoards({ ...req.body.user });

    return res.status(201).json(boards);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const board: IBoard = await BoardController.UpdateBoard({ _id: req.params.id, ...req.body  });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    return res.status(201).json(board);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

boardRouter.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user;
    
    const board: IBoard = await BoardController.DeleteBoard({ _id: req.params.id, userId  });

    if (!board) {
      return res.status(404).json({ message: global.BOARD_NOT_FOUND }); 
    }

    return res.status(201).json({ message: global.LEFT_BOARD });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

export default boardRouter;
