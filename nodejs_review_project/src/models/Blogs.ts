import mongoose, { Document, Schema } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: Array<String>;
  category: mongoose.Types.ObjectId;
  creationDate: Date;
  views: Number;
  likes: Number;
}

export const BlogSchema = new Schema<IBlogPost>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: false,
  },
  tags: [
    {
      type: String,
    },
  ],
  creationDate: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    unique: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
});
