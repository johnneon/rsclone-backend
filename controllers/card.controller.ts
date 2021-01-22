import Column, { IColumn } from './../models/Column';
import Board from './../models/Board';
import Card, { ICard } from '../models/Card';

const CreateCard = async ({ name, position, columnId }) => {
  return await Card
    .create({ name, position, columnId })
    .then( async (card: ICard) => {
      console.log(card._id)
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

const UpdateCard = async ({ name, position, content, columnId, id }) => {
    const card: ICard = await Card.findById(id);

    if (name) {
      card.name = name;
    }

    if (columnId && position) {
      const prevColumn = card.columnId;
      
      await Column.updateOne(
        { _id: prevColumn },
        { $pull: { cards: id } }
      );

      await Column.updateOne(
        { _id: columnId },
        { $push: { cards: id } }
      );

      const cards = await Card.find({ boardId: card.columnId });
      cards.sort((a, b) => a.position - b.position);

      const currentPos = card.position;
      const desiredPos = position;
      const operation = cards.splice(currentPos, 1);
      cards.splice(desiredPos, 0, ...operation);
      cards.forEach((el, ind) => el.position = ind );
    
      const bulkArr = [];
    
      for (const input of cards) {
        bulkArr.push({
          updateOne: {
            filter: { _id: input._id },
            update: { position: input.position }
          }
        });
      }
    
      await Card.bulkWrite(bulkArr);

      card.columnId = columnId;
    } else if (position || position === 0) {
      const cards = await Card.find({ boardId: card.columnId });
      cards.sort((a, b) => a.position - b.position);

      const currentPos = card.position;
      const desiredPos = position;
      const operation = cards.splice(currentPos, 1);
      cards.splice(desiredPos, 0, ...operation);
      cards.forEach((el, ind) => el.position = ind );
    
      const bulkArr = [];
    
      for (const input of cards) {
        bulkArr.push({
          updateOne: {
            filter: { _id: input._id },
            update: { position: input.position }
          }
        });
      }
    
      await Card.bulkWrite(bulkArr);

      card.position = position;
    }

    if (content) {
      card.content = content;
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