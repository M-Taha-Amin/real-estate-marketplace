export function ApiError(message, statusCode) {
  const error = new Error(message || 'Internal Server Error');
  error.statusCode = Number(statusCode) || 500;
  error.success = false;
  return error;
}
