import { Request, Response, Router } from 'express';
import ColumnController from '../controllers/column.controller';
import { IColumn } from '../models/Column';
import auth from '../middleware/auth.middleware';
import global from '../variables';

const columnRouter = Router();

columnRouter.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { name, boardId } = req.body;

    const check = global.FORBIDDEN_SYMBOLS_REGEXP;

    if (check.test(name)) {
      return res.status(400).json({ message: global.INCORECT_CHARTS });
    }

    if (!boardId) {
      return res.status(400).json({ message: global.BOARD_NOT_FOUND });
    }

    const column: Promise<IColumn> = await ColumnController.CreateColumn({ ...req.body });

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

columnRouter.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const column: IColumn = await ColumnController.GetColumn({ id: req.params.id });

    if (!column) {
      return res.status(400).json({ message: global.COLUMN_NOT_FOUND });
    }

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

columnRouter.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (name) {
      const check = global.FORBIDDEN_SYMBOLS_REGEXP;

      if (check.test(name)) {
        return res.status(400).json({ message: global.INCORECT_CHARTS });
      }
    }

    const column: IColumn = await ColumnController.UpdateColumn({ id: req.params.id, ...req.body });

    return res.status(201).json(column);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

columnRouter.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const column: Promise<IColumn> = ColumnController.DeleteColumn({ id: req.params.id });

    if (!column) {
      return res.status(400).json({ message: global.COLUMN_NOT_FOUND });
    }

    return res.status(201).json({ message: global.DELETED_COLUMN });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

export default columnRouter;
