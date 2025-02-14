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
import { User } from './models/User';
import bcrypt from 'bcrypt';
import { AppDataSource } from './config/database';
import helmet from 'helmet';
import uploadRouter from './routes/upload';
// import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/identity', express.static(path.join(__dirname, '../uploads/identity')));
app.use('/uploads/clothes', express.static(path.join(__dirname, '../uploads/clothes')));

// Thêm middleware logging
// if (process.env.NODE_ENV === 'production') {
//   app.use(require('morgan')('combined'));
// }

// Thêm security headers
app.use(helmet());
app.disable('x-powered-by');

// Thêm cấu hình session cho production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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

// Seed admin user
const seedAdmin = async () => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { phone: "12345679" }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = userRepository.create({
        phone: "12345679",
        password: hashedPassword,
        name: "Admin PA Boutique",
        role: "admin"
      });

      await userRepository.save(admin);
      console.log("Tạo tài khoản admin thành công!");
    } else {
      console.log("Tài khoản admin đã tồn tại!");
    }
  } catch (error) {
    console.error("Lỗi khi tạo admin:", error);
  }
};

// Thêm middleware để log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to SQLite
connectDB().then(async () => {
  // Seed admin user
  await seedAdmin();

  // Routes
  app.use('/api/clothes', router);
  app.use('/api/rentals', rentalRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/upload', uploadRouter);
  app.get('/api/clothes/:id', clothesController.getClothesById);

  app.listen(port, () => {
    console.log(`Server đang chạy trên port ${port}`);
  });
}).catch(error => {
  console.error("Không thể khởi động server:", error);
});

// Thêm xử lý lỗi toàn cục
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 