import { DataSource } from "typeorm";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";
import { User } from '../models/User';
import { Session } from '../models/Session';
import path from 'path';

// Sử dụng đường dẫn tuyệt đối
const dbPath = path.resolve(__dirname, '../../database1.sqlite');
console.log('Database path:', dbPath); // Log để kiểm tra đường dẫn

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Clothes, Rental, Session],
  migrations: [],
  subscribers: [],
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully at:", dbPath);
  } catch (error) {
    console.error("Lỗi kết nối database:", error);
    console.error("Database path:", dbPath);
    process.exit(1);
  }
}; 