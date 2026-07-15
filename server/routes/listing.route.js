import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  createListing,
  getUserListings,
  deleteListing,
  updateListing,
  getSingleListing,
  searchAllListings,
  getAllListings,
} from '../controllers/listing.controller.js';
import multer, { memoryStorage } from 'multer';

const router = express.Router();
const upload = multer({
  storage: memoryStorage(),
  limits: {
    files: 3,
    fileSize: 2 * 1024 * 1024,
  },
});

router.get('/search', searchAllListings);
router.get('/', getAllListings);
router.post('/', isAuthenticated, upload.array('images'), createListing);
router.get('/me', isAuthenticated, getUserListings);
router.get('/:listingId', getSingleListing);
router.delete('/:listingId', isAuthenticated, deleteListing);
router.put(
  '/:listingId',
  isAuthenticated,
  upload.array('images'),
  updateListing,
);

export default router;
