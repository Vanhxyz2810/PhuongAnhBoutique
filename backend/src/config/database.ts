import { DataSource } from "typeorm";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";
import { User } from '../models/User';
import { Session } from '../models/Session';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');
console.log('Database path:', dbPath);

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: dbPath,
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
    process.exit(1);
  }
}; 