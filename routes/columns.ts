import { Router } from 'express';
import Column from '../models/Column';
import Board from '../models/Board';
import Card from '../models/Card';
import auth from '../middleware/auth.middleware';

const columnRouter = Router();

columnRouter.post('/create', auth, async (req, res, next) => {
  try {
    const { name, position, boardId } = req.body;

    if (!boardId) {
      return res.status(400).json({ message: 'Board not found!' });
    }
    
    const column: any = new Column({ name, position, boardId });
    
    await Board.updateOne({ _id: boardId }, { $push: { columns: { _id: column._id } } });
    
    column.save();

    return res.status(201).json({ column });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

columnRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const column: any = await Column.findById(req.params.id);

    const cards = await Card.find({ column: req.params.id });
    
    return res.status(201).json({ column, cards: [...cards] });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

columnRouter.put('/:id', auth, async (req, res, next) => {
  try {
    const { name, position } = req.body;
    
    const column: any = await Column.findById(req.params.id);


    if (name) {
      column.name = name;
    }
    if (position || position === 0) {
      column.position = position;
    }

    column.save();

    return res.status(201).json({ column });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

columnRouter.delete('/:id', auth, async (req, res, next) => {
  try {
    const column: any = await Column.findByIdAndDelete(req.params.id);

    await Board.updateOne(
      { _id: column.boardId },
      {
        $pull: { columns: column._id }
      }
    );

    await Card.deleteMany({ column: column._id });

    return res.status(201).json({ message: 'Column has been deleted!' });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default columnRouter;
