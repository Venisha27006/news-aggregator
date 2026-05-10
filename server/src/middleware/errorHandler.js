/**
 * Central error handler — keeps API responses consistent.
 */
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack }),
  });
}
