require('dotenv').config();
import jwt = require('jsonwebtoken');

export default (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'You are not authorized!' });
    }

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'You are not authorized!' });
  }
}