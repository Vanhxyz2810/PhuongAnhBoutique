import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import clothesRouter from './routes/clothes';
import rentalRouter from './routes/rental';
import { connectDB } from './config/database';
import fs from 'fs';
import path from 'path';

const app = express();

// Cấu hình CORS chi tiết hơn
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL của frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Thêm headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clothes', clothesRouter);
app.use('/api/rentals', rentalRouter);

const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads directory:', uploadsPath);

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../uploads/clothes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Thêm vào phần tạo thư mục
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));
console.log('Serving static files from:', uploadsPath);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 