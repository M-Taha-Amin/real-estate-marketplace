import express from 'express';
import {
  signIn,
  signUp,
  getMe,
  logout,
  googleAuth
} from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/me', isAuthenticated, getMe);
router.post('/sign-out', logout);
router.post('/google', googleAuth);

export default router;
