/* global process */
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 * Accepts multipart/form-data with a single field named "file".
 * Returns { url, publicId, resourceType, format, bytes }.
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { mimetype, buffer, originalname } = req.file;

    // Determine Cloudinary resource_type from MIME
    let resourceType = 'auto';
    if (mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimetype === 'application/pdf' || mimetype === 'text/plain') {
      resourceType = 'raw';
    }

    // Determine folder based on type
    const folder = mimetype.startsWith('video/')
      ? 'stride/videos'
      : mimetype.startsWith('image/')
        ? 'stride/images'
        : 'stride/documents';

    // Upload to Cloudinary using a stream from the buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
          public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
          // For videos, apply basic optimizations
          ...(resourceType === 'video' ? {
            eager: [{ quality: 'auto', fetch_format: 'mp4' }],
            eager_async: true,
          } : {}),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      originalName: originalname,
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (error.message?.includes('File too large')) {
      return res.status(413).json({ message: 'File is too large. Maximum size is 100MB.' });
    }

    res.status(500).json({
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};

/**
 * Delete a file from Cloudinary by public_id.
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    res.json({ result: result.result });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
};
