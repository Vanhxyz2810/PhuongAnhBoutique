import { LessThan } from "typeorm";
import { AppDataSource } from "../config/database";
import { Rental } from "../models/Rental";
import { Clothes } from "../models/Clothes";

const rentalRepository = AppDataSource.getRepository(Rental);
const clothesRepository = AppDataSource.getRepository(Clothes);

const cleanup = async () => {
  const expiredRentals = await rentalRepository.find({
    where: {
      status: 'pending',
      pendingExpireAt: LessThan(new Date())
    }
  });

  for (const rental of expiredRentals) {
    await rentalRepository.update(rental.id, { status: 'rejected' });
    await clothesRepository.update(rental.clothesId, { status: 'available' });
  }
};

// Chạy job mỗi 5 phút
setInterval(cleanup, 5 * 60 * 1000); 