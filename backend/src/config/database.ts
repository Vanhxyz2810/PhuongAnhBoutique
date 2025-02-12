import { DataSource } from "typeorm";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";
import { User } from '../models/User';
import { Session } from '../models/Session';
import { Category } from '../models/Category';
import dotenv from 'dotenv';
import { seedCategories } from '../seeders/categorySeeder';

dotenv.config();

console.log('Database config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

const dbConfig = {
  type: "postgres" as const,
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,  // Tắt SSL khi chạy local
  synchronize: true,
  logging: true,
  entities: [Clothes, Rental, User, Session, Category],
  migrations: [],
  subscribers: []
};

export const AppDataSource = new DataSource(dbConfig);

export const connectDB = async () => {
  try {
    console.log('Connecting to database with URL:', process.env.DATABASE_URL);
    await AppDataSource.initialize();
    
    // Test query để kiểm tra kết nối
    const testQuery = await AppDataSource.query('SELECT NOW()');
    console.log('Database connection test:', testQuery);
    
    console.log("✅ Database connected successfully");
    
    // Chạy seeders
    await seedCategories();
    
    // Log số lượng records trong các bảng
    const usersCount = await AppDataSource.getRepository(User).count();
    const clothesCount = await AppDataSource.getRepository(Clothes).count();
    const rentalsCount = await AppDataSource.getRepository(Rental).count();
    
    console.log('Current records in database:', {
      users: usersCount,
      clothes: clothesCount,
      rentals: rentalsCount
    });

  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    throw error;
  }
}; 