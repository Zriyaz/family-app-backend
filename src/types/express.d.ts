import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

