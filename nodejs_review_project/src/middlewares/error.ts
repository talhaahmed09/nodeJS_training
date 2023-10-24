import { Request, Response, NextFunction } from "express";
import logger from "../loggers/logger";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error using Winston
  logger.error(err);

  // Handle the error and send an appropriate response to the client
  res.status(500).json({
    error: {
      message: "Internal Server Error",
    },
  });
};

export default errorMiddleware;
