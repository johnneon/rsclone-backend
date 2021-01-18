import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import global from '../variables';

const checkRegister = [
  check('email', global.INCORECT_EMAIL).isEmail(),
  check('fullName', global.TYPE_STRING).isString(),
  check('password', global.PASS_LENGHT).isLength({ min: 6 }),
];

const checkLogin = [  
  check('email', global.INCORECT_EMAIL).isEmail().normalizeEmail(),
  check('password', global.INCORECT_PASS).exists(),
];

export default {
  checkRegister,
  checkLogin
}