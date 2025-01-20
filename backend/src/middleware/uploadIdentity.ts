import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../uploads/identity');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Thêm cấu hình cho upload
export const uploadIdentity = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif)'));
    }
  }
}); 