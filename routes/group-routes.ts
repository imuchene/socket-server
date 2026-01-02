import { Response, Router, Request } from 'express';
import { Group } from '../models/group.model';
import { isAdmin, protect } from '../middleware/auth.middleware';

export const groupRouter = Router();

// Create a group
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

// Get all groups
groupRouter.get('/', protect, async (req: Request, res: Response) => {
  try {
    const groups = await Group.find()
      .populate('admin', 'username email')
      .populate('members', 'username email');
    res.json(groups);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});
