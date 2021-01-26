require('dotenv').config();
import jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from 'express';
import global from '../variables';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.method === global.METHOD_OPTIONS) {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: global.NOT_AUTHORIZED });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.user = decoded;
    next();
  } catch (e) {
    if (e.name === global.TOKEN_EXPIRED_ERROR) {
      return res
        .status(401)
        .json({ message: global.TOKEN_EXPIRED });
    } else if (e.name === global.WEB_TOKEN_ERROR) {
      return res
        .status(401)
        .json({ message: global.INVALID_TOKEN });
    } else {
      console.error(e);
      return res.status(400).json({ message: e });
    }
  }
}