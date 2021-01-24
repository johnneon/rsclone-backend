import { Router } from 'express';
import auth from '../middleware/auth.middleware';
import CardController from '../controllers/card.controller';

const cardsRouter = Router();

cardsRouter.post('/', auth, CardController.CreateCard);

cardsRouter.get('/:id', auth, CardController.GetCard);

cardsRouter.put('/:id', auth, CardController.UpdateCard);

cardsRouter.delete('/:id', auth, CardController.DeleteCard);

export default cardsRouter;
