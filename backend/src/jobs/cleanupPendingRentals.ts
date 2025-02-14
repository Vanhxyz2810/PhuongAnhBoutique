import { LessThan } from "typeorm";
import { AppDataSource } from "../config/database";
import { Rental, RentalStatus } from "../models/Rental";
import { Clothes } from "../models/Clothes";

const rentalRepository = AppDataSource.getRepository(Rental);
const clothesRepository = AppDataSource.getRepository(Clothes);

const cleanup = async () => {
  const expiredRentals = await rentalRepository.find({
    where: [
      {
        status: RentalStatus.PENDING,
        pendingExpireAt: LessThan(new Date())
      },
      {
        status: RentalStatus.PENDING_PAYMENT,
        expireAt: LessThan(new Date())
      }
    ]
  });

  for (const rental of expiredRentals) {
    await rentalRepository.update(rental.id, { 
      status: RentalStatus.REJECTED,
      rejectedAt: new Date()
    });
    await clothesRepository.update(rental.clothesId, { 
      status: 'available' 
    });
  }
};


// Chạy job mỗi 5 phút
setInterval(cleanup, 5 * 60 * 1000); 