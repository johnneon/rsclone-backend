import { Request, Response, Router } from 'express';
import { ICard } from '../models/Card';
import auth from '../middleware/auth.middleware';
import global from '../variables';
import CardController from '../controllers/card.controller';

const cardsRouter = Router();

cardsRouter.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { name, columnId } = req.body;

    const check = global.FORBIDDEN_SYMBOLS_REGEXP;

    if (check.test(name)) {
      return res.status(400).json({ message: global.INCORECT_CHARTS });
    }

    if (!columnId) {
      return res.status(400).json({ message: global.COLUMN_NOT_FOUND });
    }

    const card: Promise<ICard> = await CardController.CreateCard({ ...req.body });

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

cardsRouter.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const card: ICard = await CardController.GetCard({ id: req.params.id });

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

cardsRouter.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (name) {
      const check = global.FORBIDDEN_SYMBOLS_REGEXP;
  
      if (check.test(name)) {
        return res.status(400).json({ message: global.INCORECT_CHARTS });
      }
    }

    const card: ICard = await CardController.UpdateCard({ id: req.params.id, ...req.body });

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

cardsRouter.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const card: ICard = await CardController.DeleteCard({ id: req.params.id });

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    return res.status(200).json({ message: global.CARD_DELETED });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
});

export default cardsRouter;
