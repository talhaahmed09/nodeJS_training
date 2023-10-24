import { Application, NextFunction, Request, Response } from "express";
import {
  addNewBlogPost,
  deleteBlog,
  getAggregatedBlog,
  getBlogByID,
  getBlogPosts,
  updateBlog,
} from "../controllers/blogPostController";
import { authorizedUser } from "../middlewares/passport-middleware";

const blogRoutes = (app: Application) => {
  app
    .route("/blog-posts")
    // get all contacts
    .get(
      authorizedUser.authenticate("jwt", { session: false }),
      getBlogPosts,
      (req: Request, res: Response, next: NextFunction) => {
        next();
      }
    );

  app
    .route("/agg-posts")
    .get(
      authorizedUser.authenticate("jwt", { session: false }),
      getAggregatedBlog,
      (req, res, next) => {
        next();
      }
    );

  // post a new contact

  app.route("/create-blog").post(
    authorizedUser.authenticate("jwt", { session: false }),
    addNewBlogPost,
    (req, res, next) => {
      next();
    },
    addNewBlogPost
  );

  app
    .route("/blog-post/:blogId")
    // get specific contact
    .get(
      authorizedUser.authenticate("jwt", { session: false }),
      getBlogByID,
      (req, res, next) => {
        next();
      }
    )

    // update a contact
    .put(
      authorizedUser.authenticate("jwt", { session: false }),
      updateBlog,
      (req, res, next) => {
        next();
      }
    )
    .delete(
      authorizedUser.authenticate("jwt", { session: false }),
      deleteBlog,
      (req, res, next) => {
        next();
      }
    );
};

export default blogRoutes;
