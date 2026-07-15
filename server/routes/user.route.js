import express from 'express';
import {
  updateProfile,
  deleteAccount,
  updatePassword,
  getUser
} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import multer, { memoryStorage } from 'multer';

const router = express.Router();
const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.put('/', isAuthenticated, upload.single('avatar'), updateProfile);
router.delete('/', isAuthenticated, deleteAccount);
router.put('/password', isAuthenticated, updatePassword);
router.get('/:userId', isAuthenticated, getUser);

export default router;
