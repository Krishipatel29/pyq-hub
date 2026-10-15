// Error with an HTTP status code, thrown from controllers
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
