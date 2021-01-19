import Column, { IColumn } from './../models/Column';
import Board from './../models/Board';
import Card, { ICard } from '../models/Card';

const CreateCard = async ({ name, position, columnId }) => {
  return await Card
    .create({ name, position, columnId })
    .then( async (card: ICard) => {
      await Column.updateOne( { _id: columnId }, { $push: { cards: { _id: card._id } } });
      return card;
    })
    .catch((err) => err);
}

const GetCard = async ({ id }) => {
  const card: ICard = await Card.findById(id);

  if (card) {
    return card;
  }
};

const UpdateCard = async ({ name, position, content, column, id }) => {
    const card: ICard = await Card.findById(id);

    if (name) {
      card.name = name;
    }

    if (position || position === 0) {
      card.position = position;
    }

    if (content) {
      card.content = content;
    }

    if (column) {
      const prevColumn = card.columnId;
      
      await Column.updateOne(
        { _id: prevColumn },
        { $pull: { cards: id } }
      );

      await Column.updateOne(
        { _id: column },
        { $push: { cards: id } }
      );

      card.columnId = column;
    }

    card.save();

    return card;
};

const DeleteCard = async ({ id }) => {
  const card: ICard = await Card.findByIdAndDelete(id);

  if (card) {
    await Column.updateOne(
      { _id: card.columnId },
      { $pull: { cards: id } }
    );
    
    return card;
  }
};

export default {
  CreateCard,
  GetCard,
  UpdateCard,
  DeleteCard,
};