import { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  created_date: Date;
}

export const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
});
