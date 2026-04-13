import multer from 'multer';

// Use memory storage for Cloudinary stream uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Look for pdf or standard image formats as proof
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and image formats are allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter
});

export default upload;
