import { ApiError } from '../utils/error.js';
import { ApiResponse } from '../utils/response.js';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { uploadBuffer } from '../utils/upload.js';
import User from '../models/user.model.js';
import { safeParse } from 'zod';
import {
  updatePasswordSchema,
  updateSchema,
} from '../validation-schemas/user.schema.js';
import bcrypt from 'bcrypt';
import Listing from '../models/listing.model.js';

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    const { name, email } = req.body;
    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError('Bad Request', 400);
    }

    user.name = name;
    user.email = email;

    if (req.file) {
      if (!req.file.mimetype.startsWith('image')) {
        throw ApiError('Profile Picture must be an image', 400);
      }
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: 'realestate-mern',
        public_id: Date.now().toString(),
        overwrite: true,
      });
      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;
    }
    await user.save();
    return ApiResponse(res, 200, 'Profile Updated', user);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    res.clearCookie('token');
    await User.findByIdAndDelete(req.userId);
    const userListings = await Listing.find({ user: user._id });

    if (userListings.length > 0) {
      for (const listing of userListings) {
        if (listing.images.length > 0) {
          await Promise.all(
            listing.images.map(img =>
              cloudinary.uploader.destroy(img.publicId),
            ),
          );
        }
      }
      await Listing.deleteMany({ user: user._id.toString() });
    }

    return ApiResponse(res, 200, 'User Deleted');
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const result = updatePasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw ApiError('Bad Request', 400);
    }
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let user = await User.findById(req.userId);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      throw ApiError('Current Password is incorrect', 400);
    }
    if (newPassword !== confirmPassword) {
      throw ApiError('Passwords do not match', 400);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    user = user.toObject();
    delete user.password;
    return ApiResponse(res, 201, 'Password Updated', user);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw ApiError('User not found', 404);
    }
    return ApiResponse(res, 200, 'User Fetched', user);
  } catch (error) {
    next(error);
  }
}
