import { IUser } from './../models/User';
import { Request, Response } from 'express';
import Column from './../models/Column';
import Card, { ICard } from '../models/Card';
import global from '../variables';

const {
  FORBIDDEN_SYMBOLS_REGEXP,
  INCORECT_CHARTS,
  RANDOM_ERROR,
  CARD_NOT_FOUND,
  COLUMN_NOT_FOUND,
  INCORECT_POSITION,
  CARD_DELETED
} = global;

const CreateCard = async (req: Request, res: Response) => {
  try {
    const { name, columnId } = req.body;

    const check = FORBIDDEN_SYMBOLS_REGEXP;
  
    if (check.test(name)) {
      return res.status(400).json({ message: INCORECT_CHARTS });
    }
  
    if (!columnId) {
      return res.status(400).json({ message: COLUMN_NOT_FOUND });
    }

    const card = await Card
      .create({ name, columnId })
      .then( async (card: ICard) => {
        await Column.updateOne( { _id: columnId }, { $push: { cards: { _id: card._id } } });
        return card;
      })
      .catch((err) => err);

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
}

const GetCard = async (req: Request, res: Response) => {
  try {
    const card: ICard = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: CARD_NOT_FOUND });
    }

    return res.status(201).json(card);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const UpdateCard = async (req: Request, res: Response) => {
  try {
    const { name, position, content, columnId, add, kick, label } = req.body;
    const { id } = req.params;

    const card: ICard = await Card.findById(id);
    const prevColumn = card.columnId;
    const currentColumn = columnId;

    if (!card) {
      return res.status(404).json({ message: CARD_NOT_FOUND });
    }

    if (label) {
      const checkLabel = card.labels.findIndex((el) => el.color === label.color);
      
      if (checkLabel === -1) {
        card.labels.push(label);
      } else {
        card.labels.splice(checkLabel, 1);
      }
    }

    if (add) {
      const index = card.users.indexOf(add);

      if (index === -1) {
        card.users.push(add);
      }
    }

    if (kick) {
      const index = card.users.indexOf(kick);

      card.users.splice(index, 1);
    }

    if (name) {
      const check = FORBIDDEN_SYMBOLS_REGEXP;
  
      if (check.test(name)) {
        return res.status(400).json({ message: INCORECT_CHARTS });
      }

      card.name = name;
    }

    if (content) {
      card.content = content;
    }

    if (columnId && (position || position === 0)) {
      const column = await Column.findById(columnId);

      if (!column) {
        return res.status(404).json({ message: COLUMN_NOT_FOUND });
      }

      if (position > column.cards.length || position < 0) {
        return res.status(400).json({ message: INCORECT_POSITION });
      }

      const pasteCard = {
        $push: {
          cards: {
             $each: [ id ],
             $position: position
          }
        }
      };

      const deleteCard = {
        $pull: { cards: id }
      };

      const outsideColumn = (prevColumn.toString() === currentColumn.toString())
      ? { _id: currentColumn }
      : { _id: prevColumn };
      
      const insideColumn = { _id: currentColumn };

      await Column.findOneAndUpdate(outsideColumn, deleteCard).catch((e) => e);
  
      await Column.findOneAndUpdate(insideColumn, pasteCard).catch((e) => e);
    
      card.columnId = currentColumn;
    }

    await card.save();

    const updatedCard: ICard = await Card.findById(id).populate('users');

    updatedCard.users.map((user: IUser) => {
      user.password = undefined;
      user.boards = undefined;
      user.notifications = undefined;
    });

    return res.status(201).json(updatedCard);
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

const DeleteCard = async (req: Request, res: Response) => {
  try {
    const card: ICard = await Card.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({ message: CARD_NOT_FOUND });
    }

    await Column.updateOne(
      { _id: card.columnId },
      { $pull: { cards: req.params.id } }
    );

    return res.status(201).json({ message: CARD_DELETED });
  } catch (e) {
    return res.status(500).json({ message: RANDOM_ERROR });
  }
};

export default {
  CreateCard,
  GetCard,
  UpdateCard,
  DeleteCard,
};