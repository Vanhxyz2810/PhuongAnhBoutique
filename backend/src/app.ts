import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import clothesRouter from './routes/clothes';
import rentalRouter from './routes/rental';
import { connectDB } from './config/database';
import fs from 'fs';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
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

app.use('/uploads', express.static(uploadsPath));
console.log('Serving static files from:', uploadsPath);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 