import multer from 'multer';

// Use memory storage — files are kept in buffer (no disk writes)
const storage = multer.memoryStorage();

// File filter: allow video, image, PDF, and text files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Video
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    // Image
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported. Allowed types: video, image, PDF, TXT.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

export default upload;
