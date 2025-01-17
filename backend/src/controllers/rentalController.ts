import { Request, Response, RequestHandler } from 'express';
import { Rental } from '../models/Rental';
import { Clothes } from '../models/Clothes';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';

const rentalRepository = AppDataSource.getRepository(Rental);
const clothesRepository = AppDataSource.getRepository(Clothes);

export default {
  create: (async (req: Request, res: Response) => {
    try {
      const {
        customerName,
        clothesIds,
        quantities,
        rentDate,
        returnDate,
        isPaid,
        totalAmount
      } = req.body;

      // Lưu ảnh CCCD
      let identityCardPath = '';
      if (req.file) {
        identityCardPath = `/uploads/identity/${req.file.filename}`;
      }

      // Parse arrays từ string JSON
      const parsedClothesIds = JSON.parse(clothesIds);
      const parsedQuantities = JSON.parse(quantities);

      // Tạo đơn thuê mới
      const rental = await Rental.create({
        customerName,
        identityCard: identityCardPath,
        clothesIds: parsedClothesIds,
        quantities: parsedQuantities,
        rentDate: new Date(rentDate),
        returnDate: new Date(returnDate),
        isPaid: isPaid === 'true',
        totalAmount: Number(totalAmount)
      }).save();

      // Cập nhật trạng thái quần áo thành 'rented'
      for (const clothesId of parsedClothesIds) {
        await clothesRepository.update(clothesId, { status: 'rented' });
      }

      console.log('Created rental:', rental);
      res.status(201).json(rental);

    } catch (error) {
      console.error('Error creating rental:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Lỗi khi tạo đơn thuê' });
    }
  }) as RequestHandler,

  getAll: (async (_req, res) => {
    try {
      const rentals = await Rental.find({
        order: { createdAt: 'DESC' }
      });
      console.log('Fetched rentals:', rentals);
      res.json(rentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  updatePaymentStatus: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isPaid } = req.body;

      const rental = await rentalRepository.findOne({
        where: { id: Number(id) }
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
      }

      await rentalRepository.update(id, { isPaid });

      res.json({ message: 'Đã cập nhật trạng thái thanh toán' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thanh toán' });
    }
  }) as RequestHandler
}; 