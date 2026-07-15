import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
