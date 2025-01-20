import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import router from './routes/clothes';
import path from 'path';
import clothesController from './controllers/clothesController';
import rentalRouter from './routes/rental';
import authRouter from './routes/auth';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/identity', express.static(path.join(__dirname, '../uploads/identity')));
app.use('/uploads/clothes', express.static(path.join(__dirname, '../uploads/clothes')));

const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/clothes'),
  path.join(__dirname, '../uploads/identity')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Connect to SQLite
connectDB().then(() => {
  // Routes
  app.use('/api/clothes', router);
  app.use('/api/rentals', rentalRouter);
  app.use('/api/auth', authRouter);
  app.get('/api/clothes/:id', clothesController.getClothesById);

  app.listen(port, () => {
    console.log(`Server đang chạy trên port ${port}`);
  });
}).catch(error => {
  console.error("Không thể khởi động server:", error);
}); 