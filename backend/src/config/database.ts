import { DataSource } from "typeorm";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";
import { User } from '../models/User';
import { Session } from '../models/Session';

console.log('Database config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  synchronize: true,
  logging: true,
  entities: [Clothes, Rental, User, Session],
  migrations: [],
  subscribers: []
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}; 