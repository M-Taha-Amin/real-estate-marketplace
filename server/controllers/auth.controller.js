import User from '../models/user.model.js';
import { ApiError } from '../utils/error.js';
import { ApiResponse } from '../utils/response.js';
import bcrypt from 'bcrypt';
import z from 'zod';
import {
  signUpSchema,
  signInSchema,
} from '../validation-schemas/user.schema.js';
import jwt from 'jsonwebtoken';
import { googleClient } from '../utils/googleClient.js';
import { setTokenCookie } from '../utils/auth.js';

export async function signUp(req, res, next) {
  try {
    if (req.user) {
      throw ApiError('Already Logged In', 409);
    }
    const result = signUpSchema.safeParse(req.body);
    if (!result.success) {
      throw ApiError('Bad Request', 400);
    }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      email: email,
    });
    if (existingUser) {
      throw ApiError('User Account Registerd', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser = await User({ name, email, password: hashedPassword });
    await newUser.save();
    newUser = newUser.toObject();
    setTokenCookie(newUser._id, res);
    return ApiResponse(res, 201, 'User Registerd', newUser);
  } catch (error) {
    next(error);
  }
}

export async function signIn(req, res, next) {
  try {
    const result = signInSchema.safeParse(req.body);
    if (!result.success) {
      throw ApiError('Bad Request', 400);
    }
    const { email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw ApiError('Account not registered', 401);
    }
    if (existingUser.provider !== 'local') {
      throw ApiError('Try again with Google', 400);
    }
    const isPasswordMatch = bcrypt.compareSync(password, existingUser.password);
    if (!isPasswordMatch) {
      throw ApiError('Invalid Email or Password', 400);
    }
    setTokenCookie(existingUser._id, res);
    existingUser = existingUser.toObject();
    delete existingUser.password;
    return ApiResponse(res, 200, 'User Logged in', existingUser);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('-password');
    return ApiResponse(res, 200, 'Logged in user fetched', user);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie('token');
    return ApiResponse(res, 200, 'Logged out');
  } catch (error) {
    next(error);
  }
}

export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw ApiError('Google Auth Failed', 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const existingUser = await User.findOne({ googleId: payload.sub }).select(
      '-password',
    );

    if (!existingUser) {
      const existingUserEmail = await User.findOne({ email: payload.email });
      if (existingUserEmail) {
        throw ApiError(
          'User account already exist, Please login via email/password',
          409,
        );
      }
      let newUser = new User({
        name: payload.name,
        email: payload.email,
        provider: 'google',
        avatar: payload.picture,
        googleId: payload.sub,
      });
      await newUser.save();
      newUser = newUser.toObject();
      delete newUser.password;
      setTokenCookie(newUser._id, res);
      return ApiResponse(res, 201, 'User logged in', newUser);
    } else {
      setTokenCookie(existingUser._id, res);
      return ApiResponse(res, 200, 'User logged in', existingUser);
    }
  } catch (error) {
    next(error);
  }
}
