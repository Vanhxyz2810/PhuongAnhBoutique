import { Request, Response, RequestHandler } from 'express';
import { Clothes } from '../models/Clothes';
import { AppDataSource } from '../config/database';
import fs from 'fs';
import path from 'path';
import { MulterRequest } from '../config/multer';
import { Rental } from '../models/Rental';
import { uploadToCloudinary } from '../middleware/uploadToCloud';
import { Category } from '../models/Category';
// import { seedCategories } from '../seeders/categorySeeder';
import { ILike, Not } from 'typeorm';

const clothesRepository = AppDataSource.getRepository(Clothes);
const categoryRepository = AppDataSource.getRepository(Category);

export default {
  getAll: (async (_req, res) => {
    try {
      console.log('Fetching all clothes...');
      const clothes = await clothesRepository.find({
        order: {
          isPinned: 'DESC',
          pinnedAt: 'DESC',
          createdAt: 'DESC'
        }
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
      const files = req.files as Express.Multer.File[];

      if (files && files.length > 0) {
        // Upload tất cả ảnh lên Cloudinary
        const imageUrls = await Promise.all(
          files.map(file => uploadToCloudinary(file))
        );

        // Lưu mảng URLs vào trường images
        clothesData.images = imageUrls;
        // Ảnh đầu tiên sẽ là ảnh chính
        clothesData.image = imageUrls[0];
      }

      const clothes = clothesRepository.create({
        ...clothesData,
        rentalPrice: Number(clothesData.rentalPrice),
        status: 'available'
      });

      await clothesRepository.save(clothes);
      
      // Log để debug
      console.log('Created clothes with images:', clothes);
      
      res.status(201).json(clothes);
    } catch (error) {
      console.error('Error creating clothes:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  update: (async (req: MulterRequest, res: Response) => {
    try {
      const { id } = req.params;
      const clothesData = req.body;
      const files = req.files as Express.Multer.File[];

      const clothes = await clothesRepository.findOne({ where: { id } });
      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      if (files && files.length > 0) {
        // Upload tất cả ảnh mới lên Cloudinary
        const imageUrls = await Promise.all(
          files.map(file => uploadToCloudinary(file))
        );

        // Cập nhật cả mảng images và ảnh chính
        clothes.images = imageUrls;
        clothes.image = imageUrls[0];
      }

      // Cập nhật các trường khác
      Object.assign(clothes, {
        ...clothesData,
        rentalPrice: Number(clothesData.rentalPrice)
      });

      await clothesRepository.save(clothes);
      
      // Log để debug
      console.log('Updated clothes with images:', clothes);
      
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

  getClothesById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const clothes = await clothesRepository.findOne({ where: { id } });

      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      // Log để debug
      console.log('Retrieved clothes with images:', clothes);

      res.json({
        id: clothes.id,
        name: clothes.name,
        price: clothes.rentalPrice,
        originalPrice: clothes.rentalPrice * 2,
        images: clothes.images || [clothes.image], // Fallback to array with single image
        image: clothes.image,
        description: clothes.description,
        status: clothes.status,
        category: clothes.category
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

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
        // await seedCategories();
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
  },

  togglePin: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const clothes = await clothesRepository.findOne({ where: { id } });
      
      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      clothes.isPinned = !clothes.isPinned;
      clothes.pinnedAt = clothes.isPinned ? new Date() : undefined;
      
      await clothesRepository.save(clothes);
      
      res.json({ 
        message: clothes.isPinned ? 'Đã ghim sản phẩm' : 'Đã bỏ ghim sản phẩm'
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};