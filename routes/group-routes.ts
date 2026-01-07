import { Response, Router, Request } from 'express';
import { Group } from '../models/group.model';
import { isAdmin, authGuard } from '../middleware/auth.middleware';
import { Types } from 'mongoose';

export const groupRouter = Router();

// Create a group
groupRouter.post(
  '/',
  authGuard,
  isAdmin,
  async (req: Request, res: Response) => {
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
  },
);

// Get all groups
groupRouter.get('/', authGuard, async (req: Request, res: Response) => {
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

// Join a group
groupRouter.post(
  '/:groupId/join',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const group = await findGroup(req.params.groupId);

      if (group.members.includes(req.user._id)) {
        return res
          .status(400)
          .json({ message: 'Already a member of this group' });
      }

      group.members.push(req.user._id);

      await group.save();

      return res.json({ message: 'Successfully joined this group' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  },
);

// Leave a group
groupRouter.delete(
  '/:groupId/leave',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      const group = await findGroup(req.params.groupId);

      if (!group.members.includes(req.user._id)) {
        return res.status(400).json({ message: 'Not a member of this group' });
      }

      group.members = group.members.filter((memberId: Types.ObjectId) => {
        return memberId.toString() !== req.user._id.toString();
      });

      await group.save();

      return res.json({ message: 'Successfully left this group' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  },
);

async function findGroup(groupId: string) {
  // Check if the groupId is a valid ObjectId
  if (!Types.ObjectId.isValid(groupId)) {
    throw new Error('Group not found');
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new Error('Group not found');
  }
  return group;
}
