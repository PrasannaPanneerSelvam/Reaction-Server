export class AppError extends Error {
  constructor(message, errorCode, statusCode, reason) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.reason = reason;
  }
}

export class InternalServerError extends AppError {
  constructor(statusCode) {
    super("Internal Server Error", 500, statusCode);
  }
}

export class BadRequest extends AppError {
  constructor(errorCode, message = "Bad Request", reason) {
    super(message, errorCode, 400, reason);
  }
}

export class UnauthorizedRequest extends AppError {
  constructor(errorCode) {
    super("Unauthorized request", errorCode, 401);
  }
}

export class NotFound extends AppError {
  constructor(errorCode, message = "Resource Not Found") {
    super(message, errorCode, 404);
  }
}
