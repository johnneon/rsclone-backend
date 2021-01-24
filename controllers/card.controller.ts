import { Request, Response } from 'express';
import Column from './../models/Column';
import Card, { ICard } from '../models/Card';
import global from '../variables';

const CreateCard = async (req: Request, res: Response) => {
  try {
    const { name, columnId } = req.body;

    const check = global.FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: global.INCORECT_CHARTS });
    }
  
    if (!columnId) {
      return res.status(400).json({ message: global.COLUMN_NOT_FOUND });
    }

    const cards = await Card.find({ columnId });

    let cardPosition: number = 0;

    if (cards.length) {
      cardPosition = cards.length;
    }
  
    const card = await Card
      .create({ name, position: cardPosition, columnId })
      .then( async (card: ICard) => {
        console.log(card._id)
        await Column.updateOne( { _id: columnId }, { $push: { cards: { _id: card._id } } });
        return card;
      })
      .catch((err) => err);

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
}

const GetCard = async (req: Request, res: Response) => {
  try {
    const card: ICard = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

const UpdateCard = async (req: Request, res: Response) => {
  try {
    const { name, position, content, columnId } = req.body;

    const card: ICard = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    const chengeName = () => {
      const check = global.FORBIDDEN_SYMBOLS_REGEXP;
  
      if (check.test(name)) {
        return res.status(400).json({ message: global.INCORECT_CHARTS });
      }

      card.name = name;
    };

    const sortCards = async (cards: Array<ICard>) => {
      cards.forEach((el, ind) => el.position = ind );
      console.log(cards);
    
      const bulkArr = [];
    
      for (const input of cards) {
        bulkArr.push({
          updateOne: {
            filter: { _id: input._id },
            update: { position: input.position }
          }
        });
      }

      await Card.bulkWrite(bulkArr).catch((e) => e);
    };

    const changeCardsPositions = async (cards: Array<ICard>) => {
      cards.sort((a, b) => a.position - b.position);
      cards.forEach((el, ind) => el.position = ind );

      const currentPos = card.position;
      const desiredPos = position;
      const operation = cards.splice(currentPos, 1);
      cards.splice(desiredPos, 0, ...operation);
      
      
      await sortCards(cards);
    }

    const changePosition = async () => {
      const cards = await Card.find({ columnId: card.columnId });

      if (position > (cards.length - 1) || position < 0) {
        return res.status(400).json({ message: 'Incorect position!' });
      }
    
      await changeCardsPositions(cards);

      card.position = position;
    }

    const changeColumn = async () => {
      const column = await Column.findById(card.columnId);
      const prevColumn = column._id;
      const currentColumn = columnId;

      if (!column) {
        return res.status(400).json({ message: global.COLUMN_NOT_FOUND });
      }
      
      await Column.updateOne(
        { _id: prevColumn },
        { $pull: { cards: req.params.id } }
      ).catch((e) => e);

      await Column.updateOne(
        { _id: currentColumn },
        { $push: { cards: req.params.id } }
      );

      await Card.updateOne({ _id: req.params.id }, { columnId: currentColumn }).catch((e) => e);

      const prevColumnCards = await Card.find({ columnId: prevColumn });

      await sortCards(prevColumnCards);

      const currentColumnCards = await Card.find({ columnId: currentColumn });

      await changeCardsPositions(currentColumnCards);
    }

    if (name) {
      chengeName();
    }

    if (columnId) {
      await changeColumn();
    } else if (position || position === 0) {
      await changePosition();
    }

    if (content) {
      card.content = content;
    }

    card.save();

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

const DeleteCard = async (req: Request, res: Response) => {
  try {
    const card: ICard = await Card.findByIdAndDelete(req.params.id);

    if (card) {
      await Column.updateOne(
        { _id: card.columnId },
        { $pull: { cards: req.params.id } }
      );
      
      return card;
    }

    if (!card) {
      return res.status(404).json({ message: global.CARD_NOT_FOUND });
    }

    return res.status(200).json({ message: global.CARD_DELETED });
  } catch (e) {
    return res.status(500).json({ message: global.RANDOM_ERROR });
  }
};

export default {
  CreateCard,
  GetCard,
  UpdateCard,
  DeleteCard,
};