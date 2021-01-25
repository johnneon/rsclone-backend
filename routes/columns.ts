import { Router } from 'express';
import ColumnController from '../controllers/column.controller';
import auth from '../middleware/auth.middleware';

const columnRouter = Router();

columnRouter.post('/', auth, ColumnController.CreateColumn);

columnRouter.get('/:id', auth, ColumnController.GetColumn);

columnRouter.put('/:id', auth, ColumnController.UpdateColumn);

columnRouter.delete('/:id', auth, ColumnController.DeleteColumn);

export default columnRouter;
