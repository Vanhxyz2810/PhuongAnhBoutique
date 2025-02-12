import { Request, Response, RequestHandler } from 'express';
import { Clothes } from '../models/Clothes';
import { AppDataSource } from '../config/database';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../config/multer';
import { Rental } from '../models/Rental';
import { uploadToCloudinary } from '../middleware/uploadToCloud';
import { Category } from '../models/Category';
import { seedCategories } from '../seeders/categorySeeder';

const clothesRepository = AppDataSource.getRepository(Clothes);
const categoryRepository = AppDataSource.getRepository(Category);

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
        // Upload to Cloudinary và lưu URL trực tiếp
        const imageUrl = await uploadToCloudinary(file);
        // Không cần thêm path prefix vì Cloudinary đã trả về URL đầy đủ
        clothesData.image = imageUrl;
      }

      const clothes = clothesRepository.create({
        ...clothesData,
        rentalPrice: Number(clothesData.rentalPrice),
        status: 'available'
      });

      await clothesRepository.save(clothes);
      res.status(201).json(clothes);

    } catch (error) {
      console.error('Error creating clothes:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  update: (async (req: MulterRequest, res: Response) => {
    try {
      const clothesData = req.body;
      const { id } = req.params;

      const clothes = await clothesRepository.findOne({ where: { id } });
      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      // Cập nhật các trường thông tin
      clothes.name = clothesData.name;
      clothes.ownerName = clothesData.ownerName;
      clothes.rentalPrice = Number(clothesData.rentalPrice);
      clothes.description = clothesData.description;
      clothes.status = clothesData.status;
      clothes.category = clothesData.category;

      if (req.file) {
        const imageUrl = await uploadToCloudinary(req.file);
        clothes.image = imageUrl;
      }

      await clothesRepository.save(clothes);
      res.json(clothes);

    } catch (error) {
      console.error('Error updating clothes:', error);
      res.status(500).json({ message: 'Lỗi server' });
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
  }) as RequestHandler,

  getAllCategories: async (_req: Request, res: Response) => {
    try {
      console.log('Fetching categories...');
      const categories = await categoryRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });
      console.log('Found categories:', categories);
      
      if (categories.length === 0) {
        console.log('No categories found, running seeder...');
        await seedCategories();
        const newCategories = await categoryRepository.find({
          where: { isActive: true },
          order: { name: 'ASC' }
        });
        return res.json(newCategories);
      }
      
      res.json(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ 
        message: 'Lỗi server',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  createCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const category = categoryRepository.create({ name });
      await categoryRepository.save(category);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await categoryRepository.update(id, { isActive: false });
      res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};