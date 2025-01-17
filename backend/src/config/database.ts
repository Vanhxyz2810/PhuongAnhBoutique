import { DataSource } from "typeorm";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "clothes_rental.sqlite",
  entities: [Clothes, Rental],
  synchronize: true,
  logging: false
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database đã được kết nối");
  } catch (error) {
    console.error("Lỗi kết nối database:", error);
    process.exit(1);
  }
}; 