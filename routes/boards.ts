import { IBoard } from '../models/Board';
import { Request, Response, Router } from 'express';
import auth from '../middleware/auth.middleware';
import global from '../variables';
import BoardController from '../controllers/board.controller';

const boardRouter = Router();

boardRouter.post('/', auth, BoardController.CreateBoard);

boardRouter.get('/:id', auth, BoardController.GetFullBoard);

boardRouter.get('/', auth, BoardController.GetAllBoards);

boardRouter.put('/:id', auth, BoardController.UpdateBoard);

boardRouter.delete('/:id', auth, BoardController.DeleteBoard);

export default boardRouter;
