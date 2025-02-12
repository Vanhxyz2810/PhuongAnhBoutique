import express from 'express';
import { uploadToCloudinary } from '../middleware/uploadToCloud';
import multer from 'multer';
import { auth } from '../middleware/auth';

const router = express.Router();

// Cấu hình multer để lưu file tạm thời vào memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  }
});

// Thêm middleware auth để đảm bảo user đã đăng nhập
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    const url = await uploadToCloudinary(req.file, 'feedback_images');
    res.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Lỗi khi upload file' });
  }
});

export default router; 