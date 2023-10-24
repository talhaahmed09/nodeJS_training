import { Application, NextFunction, Request, Response } from "express";
import { addUser, getUsers, loginUser } from "../controllers/userController";
import passport from "passport";
import { authorizedUser } from "../middlewares/passport-middleware";

const userRoutes = (app: Application) => {
  app
    .route("/users")
    .get(
      authorizedUser.authenticate("jwt", { session: false }),
      getUsers,
      (req: Request, res: Response, next: NextFunction) => {
        next();
      }
    );

  app.route("/login").post((req, res, next) => {
    // middleware
    passport.authenticate("local"), console.log({ req });

    next();
  }, loginUser);

  app.route("/add-user").post((req, res, next) => {
    next();
  }, addUser);
};

export default userRoutes;
