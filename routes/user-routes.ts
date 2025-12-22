import { Response, Router, Request } from 'express';
import { User } from '../models/user.model';

const userRouter = Router();

userRouter.post('/register', async (request: Request, response: Response) => {
  try {
    const { username, email, password } = request.body;
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return response.status(400).json({ message: 'User already exists' });
    }

    // Create the new user
    const user = await User.create({ username, email, password });

    if (user) {
      response.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message });
    }
  }
});
