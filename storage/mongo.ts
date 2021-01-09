import { Collection, MongoClient } from 'mongodb';
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://licht:rsclone@rsclone.clvvf.mongodb.net/rsclone?retryWrites=true&w=majority';
const dbName = 'rs-domo-backend';

const getMongoInstance = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
  
    return client.db(dbName);
  } catch (e) {
    throw e;
  }
}

const getCollection = async (collectionName: string): Promise<Collection> => {
  try {
    const db = await getMongoInstance();
  
    return db.collection(collectionName);
  } catch (e) {
    throw e;
  }
}

export default getCollection;