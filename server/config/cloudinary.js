import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The buffer of the file to upload
 * @param {string} folder - The destination folder in Cloudinary
 * @param {Object} options - Additional upload options
 * @returns {Promise<string>} The secure URL of the uploaded file
 */
export const uploadToCloudinary = (fileBuffer, folder = 'placements', options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder,
      resource_type: 'raw', // Use raw to bypass PDF image delivery restrictions
      public_id: crypto.randomBytes(12).toString('hex') + '.pdf', // Force PDF extension
    };
    
    const uploadOptions = { ...defaultOptions, ...options };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export default cloudinary;
