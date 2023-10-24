import dotenv from "dotenv";
import { CommentsSchema, IComments } from "../models/Comments";
import passportLocalMongoose from "passport-local-mongoose";
import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { BlogSchema, IBlogPost } from "../models/Blogs";
import logger from "../loggers/logger";
import { postCommentToQueue } from "../services/rabbitmq";
import jwt from "jsonwebtoken";

dotenv.config();

CommentsSchema.plugin(passportLocalMongoose);

const Comments = mongoose.model<IComments>("Comments", CommentsSchema);
const Blog = mongoose.model<IBlogPost>("BlogPost", BlogSchema);

export const postComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { blogId } = req.params;
  const bearerToken = req.headers.authorization;
  const token = bearerToken.replace("Bearer ", "");

  if (!blogId) {
    return res.status(404).json({ message: "Blog Id is required" });
  }

  const isValidObjectId = mongoose.Types.ObjectId.isValid(blogId);

  if (!isValidObjectId) {
    return res.status(400).json({ message: "Invalid blogId format" });
  }

  const validationSchema = Joi.object({
    comment: Joi.string().required(),
  });

  const { error, value } = validationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded._id;

    let newComment: IComments = new Comments({
      comment: value.comment,
      blogId: blog._id,
      userId: userId,
    });

    try {
      await newComment.save();
      await postCommentToQueue({ text: newComment });
      res.status(201).json({ message: "Comment posted successfully" });
    } catch (error) {
      logger.error("Error:", error); // Log the error using Winston
      next(error);
    }
  } catch (error) {
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};
