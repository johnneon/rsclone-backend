import { Router } from 'express';
import auth from '../middleware/auth.middleware';
import BoardController from '../controllers/board.controller';

const boardRouter = Router();

boardRouter.post('/', auth, BoardController.CreateBoard);

boardRouter.post('/invite', auth, BoardController.InviteUser);

boardRouter.post('/comein/:id', auth, BoardController.AcceptInvite);

boardRouter.delete('/ignore/:id', auth, BoardController.IgnoreInvite);

boardRouter.get('/:id', auth, BoardController.GetFullBoard);

boardRouter.get('/', auth, BoardController.GetAllBoards);

boardRouter.put('/:id', auth, BoardController.UpdateBoard);

boardRouter.delete('/:id', auth, BoardController.DeleteBoard);

export default boardRouter;
