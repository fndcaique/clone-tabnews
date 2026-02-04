export class BaseError extends Error {
  constructor({ name, message, action, statusCode, cause }) {
    super(message, { cause });
    this.name = name;
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
  constructor({ cause, statusCode } = {}) {
    super({
      name: 'InternalServerError',
      message: 'An unexpected internal error occured',
      action:
        'Please try again later or contact the support team if the problem persists',
      statusCode: statusCode || 500,
      cause,
    });
  }
}

export class ServiceError extends BaseError {
  constructor({ cause, message } = {}) {
    super({
      name: 'ServiceError',
      message: message || 'Service is unavailable',
      action: 'Verify that the service is available',
      statusCode: 503,
      cause,
    });
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super({
      name: 'MethodNotAllowedError',
      message: 'Method not allowed for this endpoint',
      action: 'Verify that the HTTP method is allowed for this endpoint',
      statusCode: 405,
    });
  }
}
