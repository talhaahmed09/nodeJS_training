import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { IUser, UserSchema } from "../models/User";

dotenv.config();
const User = mongoose.model<IUser>("User", UserSchema);

export const authorizedUser = passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    },
    function (jwtPayload, cb) {
      return User.findById(jwtPayload._id)
        .then((user) => {
          if (user) {
            return cb(null, user);
          } else {
            return cb(null, false, { message: "Unauthorized user" });
          }
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);
