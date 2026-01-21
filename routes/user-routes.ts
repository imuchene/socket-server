import { Response, Router, Request } from 'express';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { CookieNames } from '../enums/cookie-names.enum';
import { JwtData } from '../interfaces/jwt-data.interface';
import { authGuard } from '../middleware/auth.middleware';

export const userRouter = Router();

// Registration route
userRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new user
    const user = await User.create({ username, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

// Login route
userRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res
        .cookie(CookieNames.AuthCookie, generateToken(user._id), {
          signed: true,
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
          expires: new Date(Date.now() + 900000), // Set the cookie to expire in 15 minutes
        })
        .json({
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

// Logout route
userRouter.delete('/logout', authGuard, async (req: Request, res: Response) => {
  try {
    res.clearCookie(CookieNames.AuthCookie).json({ message: 'Logged out' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

const generateToken = (id: Types.ObjectId) => {
  // Set the jwt token to expire in 10 minutes
  const jwtData: JwtData = { id };
  return jwt.sign(jwtData, String(process.env.JWT_SECRET), {
    expiresIn: '10m',
  });
};
