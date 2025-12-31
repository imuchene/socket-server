import { NextFunction, Request, Response } from 'express';
import { CookieNames } from '../enums/cookie-names.enum';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.signedCookies[CookieNames.AuthCookie]) {
    res.status(401).json({ message: 'Not authorized, token not found' });
    return;
  }

  try {
    const token = req.signedCookies[CookieNames.AuthCookie];
    const decoded = jwt.verify(String(token), String(process.env.JWT_SECRET));

    if (typeof decoded !== 'string') {
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
