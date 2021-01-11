import mongoose from 'mongoose';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import authRouter from './routes/users';

const app = express();
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRouter);

app.use((req, res, next) => {
  res.json({
    statusCode: 404,
  });
});

app.use( (err, req, res, next) => {
  res.json({
    statusCode: 500,
    message: err.message,
    stack: err.stack,
  });
});

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://licht:rsclone@rsclone.clvvf.mongodb.net/rsclone?retryWrites=true&w=majority';

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (e) {
    console.warn(e.message);
    process.exit(1);
  }
}

start();

export default app;