import { AppError, BadRequest } from "../Error/AppError";

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    const responseObject = {
      errorCode: error.errorCode,
      message: error.message,
    };

    if (error instanceof BadRequest && error.reason) {
      responseObject.reason = error.reason;
    }

    return res.status(error.statusCode).json(responseObject);
  }

  // Unhandled cases
  res.status(500).json({ message: "Internal Server Error" });
};

export default errorHandler;
