import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
      default: 'https://tse2.mm.bing.net/th/id/OIP.Eh1fSIAa8xtQ9qHTV-GR_AAAAA',
    },
    avatarPublicId: {
      type: String,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
