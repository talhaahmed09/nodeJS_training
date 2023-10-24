import mongoose, { Document, Schema } from "mongoose";

export interface IComments extends Document {
  userId: mongoose.Types.ObjectId;
  comment: string;
  blogId: mongoose.Types.ObjectId;
}

export const CommentsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: false,
  },
  comment: {
    type: String,
    required: true,
  },
  blogId: {
    type: Schema.Types.ObjectId,
    ref: "Blogs",
    required: true,
    unique: false,
  },
});
