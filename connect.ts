import mongoose from 'mongoose';

type TInput = {
  uri: string;
}

export default ({uri}: TInput) => {
  const connect = async () => {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
    } catch (e) {
      console.warn(e.message);
      process.exit(1);
    }
  }
  
  connect();
}