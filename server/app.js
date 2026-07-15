import express from 'express';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import listingRoutes from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import path from 'path';

config();
const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.use((req, res) => {
  return res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(error.stack);
  }
  return res.status(error.statusCode || 500).json({
    success: error.success || false,
    message: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
  });
});

export default app;
