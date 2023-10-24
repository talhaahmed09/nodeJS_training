import { Application } from "express";
import { postComment } from "../controllers/commentsController";
import { authorizedUser } from "../middlewares/passport-middleware";

const commentsRoutes = (app: Application) => {
  app
    .route("/comment/:blogId")
    .post(
      authorizedUser.authenticate("jwt", { session: false }),
      postComment,
      (req, res, next) => {
        next();
      }
    );
};

export default commentsRoutes;
