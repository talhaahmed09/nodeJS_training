import mongoose from "mongoose";
import { IBlogPost, BlogSchema } from "../models/Blogs";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ICategory, categorySchema } from "../models/Categories";
import { IUser, UserSchema } from "../models/User";
import logger from "../loggers/logger";

const Blog = mongoose.model<IBlogPost>("BlogPost", BlogSchema);
const Category = mongoose.model<ICategory>("Category", categorySchema);
const User = mongoose.model<IUser>("User", UserSchema);

export const addNewBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const valiadationSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    author: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().required(),
  });

  const { error, value } = valiadationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const user = await User.findOne({ name: value.author });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const category = await Category.findOne({ name: value.category });

  if (!category) {
    return res.status(400).json({ error: "Category not found" });
  }

  let newBlog: IBlogPost = new Blog({
    title: value.title,
    content: value.content,
    author: user._id,
    tags: value.tags || [],
    category: category._id,
  });

  try {
    await newBlog.save();
    res.status(200).json({ message: "Blog added successfully" });
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const getBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract query parameters
    const { author, tags, groupBy, sort, filter, page, pageSize } = req.query;

    // Parse pagination options
    const pageNumber: number = parseInt(page as string, 10) || 1;
    const itemsPerPage: number = parseInt(pageSize as string, 10) || 10;

    // Create a base query
    let query = Blog.find();

    if (author) {
      query = query.where({ author });
    } else if (tags) {
      query = query.where({ tags: { $in: tags } });
    }

    // Calculate skip and limit values for pagination
    const skip = (pageNumber - 1) * itemsPerPage;

    // Execute the query with pagination
    const blogs = await query.skip(skip).limit(itemsPerPage).exec();

    // Send paginated data in the response
    const totalCount = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    res.json({
      data: blogs,
      pagination: {
        page: pageNumber,
        pageSize: itemsPerPage,
        totalItems: totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error);
    next(error);
  }
};

export const getAggregatedBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { groupBy, sort, filter } = req.query;
  try {
    let query = [];

    if (sort === "asc") {
      query = [
        {
          $sort: {
            creationDate: -1,
          },
        },
        {
          $limit: 10,
        },
      ];
    } else if (sort === "view") {
      query = [{ $sort: { views: -1 } }, { $limit: 10 }];
    } else if (groupBy === "popular") {
      query = [
        { $group: { _id: "$title", totalLikes: { $sum: "$likes" } } },
        { $sort: { totalLikes: -1 } },
        { $limit: 10 },
      ];
    }
    if (!query.length) {
      res.status(400).json({ error: "query param is not correct" });
    }

    const aggregatedData = await Blog.aggregate(query);

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const getBlogByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { blogId } = req.params;
  try {
    const blog = await Blog.findById(blogId);

    await Blog.findByIdAndUpdate(blogId, { $set: { views: 1 } }, { new: true });

    res.json(blog);
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { blogId } = req.params;

  const valiadationSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().required(),
  });

  const { error, value } = valiadationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const category = await Category.findOne({ name: value.category });

  if (!category) {
    return res.status(400).json({ error: "Category not found" });
  }

  let newBlog = {
    title: value.title,
    content: value.content,
    tags: value.tags || [],
    category: category._id,
  };

  try {
    const blog = await Blog.findById(blogId);

    const userId = req.headers["user_id"];

    if (blog.author.toString() === userId) {
      await Blog.findByIdAndUpdate(blogId, newBlog, { new: true });
      res.status(200).json({ message: "Blog updated successfully" });
    } else {
      res.status(401).json({ message: "User not authorized" });
    }
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId);

    const userId = req.headers["user_id"];

    if (blog.author.toString() === userId) {
      await Blog.findByIdAndDelete(blogId);
      res.status(200).json({ message: "Blog deleted successfully" });
    } else {
      res.status(401).json({ message: "User not authorized" });
    }
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};
