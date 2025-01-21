import { Request, Response, RequestHandler } from 'express';
import { Clothes } from '../models/Clothes';
import { AppDataSource } from '../config/database';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../config/multer';
import { Rental } from '../models/Rental';
import { uploadToCloudinary } from '../middleware/uploadToCloud';

const clothesRepository = AppDataSource.getRepository(Clothes);

export default {
  getAll: (async (_req, res) => {
    try {
      console.log('Fetching all clothes...');
      const clothes = await clothesRepository.find({
        order: { createdAt: 'DESC' }
      });
      console.log('Found clothes:', clothes);
      res.json(clothes);
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({ 
        message: 'Lỗi server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }) as RequestHandler,

  create: (async (req: MulterRequest, res: Response) => {
    try {
      const clothesData = req.body;
      const file = req.file;

      if (file) {
        // Upload to Cloudinary instead of local
        const imageUrl = await uploadToCloudinary(file);
        clothesData.image = imageUrl;
      }

      const clothes = clothesRepository.create(clothesData);
      await clothesRepository.save(clothes);

      res.status(201).json(clothes);
    } catch (error) {
      console.error('Error creating clothes:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  update: (async (req: MulterRequest, res) => {
    try {
      const clothes = await clothesRepository.findOne({
        where: { id: req.params.id }
      });

      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      if (req.file) {
        // Xóa ảnh cũ
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(clothes.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      await clothesRepository.update(req.params.id, {
        name: req.body.name,
        ownerName: req.body.ownerName,
        rentalPrice: Number(req.body.rentalPrice),
        description: req.body.description,
        status: req.body.status,
        ...(req.file && { image: `/uploads/clothes/${req.file.filename}` })
      });

      const updatedClothes = await clothesRepository.findOne({
        where: { id: req.params.id }
      });

      res.json(updatedClothes);
    } catch (error) {
      res.status(400).json({ message: 'Lỗi khi cập nhật' });
    }
  }) as RequestHandler,

  delete: (async (req, res) => {
    try {
      const clothes = await clothesRepository.findOne({
        where: { id: req.params.id },
        relations: ['rentals']
      });

      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      // Xóa file ảnh
      if (clothes.image) {
        const imagePath = path.join(__dirname, '../../uploads', path.basename(clothes.image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Xóa các rental liên quan trước
      if (clothes.rentals && clothes.rentals.length > 0) {
        const rentalRepo = AppDataSource.getRepository(Rental);
        await rentalRepo.remove(clothes.rentals);
      }

      // Sau đó xóa clothes
      await clothesRepository.remove(clothes);
      res.json({ message: 'Đã xóa thành công' });

    } catch (error) {
      console.error('Error deleting clothes:', error);
      res.status(500).json({ 
        message: 'Lỗi khi xóa',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }) as RequestHandler,

  getClothesById: (async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const clothes = await clothesRepository.findOne({
        where: { id },
        relations: ['rentals']
      });

      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      // Kiểm tra xem có đơn thuê nào đang active không
      const hasActiveRental = clothes.rentals?.some(
        rental => rental.status === 'pending' || rental.status === 'approved'
      );

      // Format response theo interface Product
      const response = {
        id: clothes.id,
        name: clothes.name,
        price: clothes.rentalPrice,
        originalPrice: clothes.rentalPrice * 2,
        images: clothes.image ? [clothes.image] : [],
        sizes: ['S', 'M', 'L'],
        description: clothes.description || 'Chưa có mô tả',
        sku: `SP${clothes.id}`,
        status: hasActiveRental ? 'rented' : 'available'
      };

      res.json(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler
};