import { Router } from 'express';
import Board from '../models/Board';
import Card from '../models/Card';
import auth from '../middleware/auth.middleware';

const cardsRouter = Router();

cardsRouter.post('/create', auth, async (req, res, next) => {
  try {
    const { name, position, columnName, boardId } = req.body;

    const check = /^.*?(?=[\^#%&$\*:<>\?/\{\|\}]).*$/g;

    if (check.test(name)) {
      return res.status(400).json({ message: 'The name can not contain invalid characters!' });
    }

    const card: any = new Card({ name, position, columnName, board: boardId });

    const board: any = await Board.findById(boardId);

    if (board) {
      const { columns } = board;

      const column: any = columns.find((el) => el.name === columnName);

      column.push(card._id);
    }

    board.save();
    card.save();

    return res.status(201).json({ card });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default cardsRouter;
