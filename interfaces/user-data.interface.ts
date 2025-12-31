import { Types } from 'mongoose';

export interface UserData {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
}
