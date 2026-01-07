import { NextFunction, Request, Response } from 'express';
import { CookieNames } from '../enums/cookie-names.enum';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.model';

const isJwtPayload = (x: string | JwtPayload): x is JwtPayload => {
  if (typeof x === 'string') {
    return false;
  }
  return true;
};

export const authGuard = async (
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

    if (isJwtPayload(decoded)) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
      next();
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized. Admin only' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};
