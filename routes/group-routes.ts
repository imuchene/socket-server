import { Response, Router, Request } from 'express';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { CookieNames } from '../enums/cookie-names.enum';
import { Group } from '../models/group.model';
import { isAdmin, protect } from '../middleware/auth.middleware';

export const groupRouter = Router();

// Registration route
groupRouter.post('/', protect, isAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    // Check if a group already exists
    const groupExists = await Group.findOne({ name });

    if (groupExists) {
      return res.status(400).json({ message: 'Group already exists' });
    }

    // Create the new group
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    if (group) {
      const populatedGroup = await Group.findById(group._id)
        .populate('admin', 'username email')
        .populate('members', 'username email');

      res.status(201).json({
        populatedGroup,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

// Login route
groupRouter.post('/login', async (req: Request, res: Response) => {
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

const generateToken = (id: Types.ObjectId) => {
  // Set the jwt token to expire in 10 minutes
  return jwt.sign({ id }, String(process.env.JWT_SECRET), { expiresIn: '10m' });
};
