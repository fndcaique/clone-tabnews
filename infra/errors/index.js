export class BaseError extends Error {
  constructor({ message, action, statusCode, cause }) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.action = action;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({
    message = 'An unexpected internal error occured',
    action = 'Please try again later or contact the support team if the problem persists',
    cause,
  } = {}) {
    super({ message, action, statusCode: 500, cause });
  }
}
