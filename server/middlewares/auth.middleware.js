import { ApiError } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export function isAuthenticated(req, res, next) {
  try {
    const { token } = req.cookies;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(ApiError('Unauthorized', 401));
  }
}
