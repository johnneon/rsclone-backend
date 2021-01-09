import * as express from 'express';
import * as logger from 'morgan';
import * as cors from 'cors';
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

export default app;