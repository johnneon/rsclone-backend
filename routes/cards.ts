import { Router } from 'express';
import Column from '../models/Column';
import Card from '../models/Card';
import auth from '../middleware/auth.middleware';

const cardsRouter = Router();

cardsRouter.post('/create', auth, async (req, res, next) => {
  try {
    const { name, position, column } = req.body;

    const check = /^.*?(?=[\^#%&$\*:<>\?/\{\|\}]).*$/g;

    if (check.test(name)) {
      return res.status(400).json({ message: 'The name can not contain invalid characters!' });
    }

    const card: any = new Card({ name, position, column });

    card.save();

    card.__v = undefined;

    return res.status(201).json({ card });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

cardsRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const card: any = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card no found!' });
    }

    card.__v = undefined;

    return res.status(201).json({ card });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

cardsRouter.delete('/:id', auth, async (req, res, next) => {
  try {
    const card: any = await Card.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card no found!' });
    }

    return res.status(200).json({ message: 'Card has been deleted!' });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

cardsRouter.put('/update/:id', auth, async (req, res, next) => {
  try {

    const { name, position, content, column } = req.body;

    const card: any = await Card.findById(req.params.id);


    if (name) {
      const check = /^.*?(?=[\^#%&$\*:<>\?/\{\|\}]).*$/g;
  
      if (check.test(name)) {
        return res.status(400).json({ message: 'The name can not contain invalid characters!' });
      }

      card.name = name;
    }

    if (position || position === 0) {
      card.position = position;
    }

    if (content) {
      card.content = content;
    }

    if (column) {
      const prevColumn = card.column;

      const newColumn = await Column.findById(prevColumn);

      if (newColumn) {
        card.column = column;
      } else {
        return res.status(404).json({ message: 'Column not found!' })
      }
    }

    card.save();

    card.__v = undefined;

    return res.status(201).json({ card });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default cardsRouter;
