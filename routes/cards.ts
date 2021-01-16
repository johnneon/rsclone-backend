import { Router } from 'express';
import Column from '../models/Column';
import Card from '../models/Card';
import auth from '../middleware/auth.middleware';

const cardsRouter = Router();

cardsRouter.post('/', auth, async (req, res, next) => {
  try {
    const { name, position, column } = req.body;

    const check = /^.*?(?=[\^#%&$\*:<>\?/\{\|\}]).*$/g;

    if (check.test(name)) {
      return res.status(400).json({ message: 'The name can not contain invalid characters!' });
    }

    const card: any = new Card({ name, position, column });

    await Column.updateOne({ _id: column }, { $push: { cards: card._id } })

    card.__v = undefined;

    card.save();


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

    await Column.updateOne(
      { _id: card.column },
      { $pull: { cards: req.params.id } }
    );

    return res.status(200).json({ message: 'Card has been deleted!' });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

cardsRouter.put('/:id', auth, async (req, res, next) => {
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
      
      await Column.updateOne(
        { _id: prevColumn },
        { $pull: { cards: req.params.id } }
      );

      await Column.updateOne(
        { _id: column },
        { $push: { cards: req.params.id } }
      );

      card.column = column;
    }

    card.save();

    card.__v = undefined;

    return res.status(201).json({ card });
  } catch (e) {
    return res.status(500).json({ message: 'Got an error!' });
  }
});

export default cardsRouter;
