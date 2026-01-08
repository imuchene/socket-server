import { Request, Response, Router } from 'express';
import { authGuard } from '../middleware/auth.middleware';
import { Message } from '../models/chat.model';
import { Types } from 'mongoose';

export const messageRouter = Router();

// Create a message
messageRouter.post('/', authGuard, async (req: Request, res: Response) => {
  try {
    const { content, groupId } = req.body;

    await validateGroupId(groupId);

    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'username email',
    );
    return res.json(populatedMessage);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

messageRouter.get(
  '/:groupId',
  authGuard,
  async (req: Request, res: Response) => {
    try {
      await validateGroupId(req.params.groupId);

      const messages = await Message.find({ group: req.params.groupId })
        .populate('sender', 'username email')
        .sort({ createdAt: -1 });
      return res.json(messages);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  },
);

async function validateGroupId(groupId: string) {
  // Check if the groupId is a valid ObjectId
  if (!Types.ObjectId.isValid(groupId)) {
    throw new Error('Group not found');
  }
}
