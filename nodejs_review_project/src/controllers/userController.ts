import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { IUser, UserSchema } from "../models/User";
import Joi from "joi";
import bcrypt from "bcrypt";
import passport from "passport-local";
import passportLocalMongoose from "passport-local-mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import logger from "../loggers/logger";
import errorMiddleware from "../middlewares/error";

dotenv.config();

UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model<IUser>("User", UserSchema);

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({}, "name email role");
    const usersArray = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
    }));
    res.status(200).json(usersArray);
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const token = jwt.sign((await user).toJSON(), process.env.JWT_SECRET_KEY);
    res.status(200).json({ message: "User Logged In", token });
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const valiadationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().required(),
    password: Joi.string().required(),
  });

  try {
    const { error, value } = valiadationSchema.validate(req.body);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "User already exist" });
    }
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser: IUser = new User({ ...value, password: hashedPassword });

    await newUser.save();

    res.status(200).json({ message: "User added" });
  } catch (error) {
    console.error("Error:", error);
    logger.error("Error:", error); // Log the error using Winston
    next(error);
  }
};
