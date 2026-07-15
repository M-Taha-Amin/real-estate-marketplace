export function ApiResponse(res, statusCode, message, payload) {
  const response = {
    message: message,
  };
  if (payload) response.payload = payload;
  return res.status(statusCode).json(response);
}
