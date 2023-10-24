import { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

export const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});
