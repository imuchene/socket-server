import { UserData } from '../../interfaces/user-data.interface';

export {};

declare global {
  namespace Express {
    interface Request {
      user: UserData;
    }
  }
}
