// this is for creating custom error
class CustomErrorHandler extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }

  static conflict(message = "conflict", statusCode = 409) {
    return new CustomErrorHandler(statusCode, message);
  }
  static unauthorized(message = "unauthorized user", statusCode = 401) {
    return new CustomErrorHandler(statusCode, message);
  }
  static wentWrong(message = "Oops.. something went wrong", statusCode = 500) {
    return new CustomErrorHandler(statusCode, message);
  }
  static notFound(message = "not found", statusCode = 404) {
    return new CustomErrorHandler(statusCode, message);
  }
  static badRequest(message = "bad request", statusCode = 400) {
    return new CustomErrorHandler(statusCode, message);
  }
}

export default CustomErrorHandler;
