import { RequestHandler } from 'express';
import { Clothes } from '../models/Clothes';
import fs from 'fs';
import path from 'path';

interface UpdateData {
  name: string;
  ownerName: string;
  rentalPrice: number;
  description?: string;
  image?: string;
}

export const clothesController = {
  getAll: (async (_req, res) => {
    try {
      const clothes = await Clothes.find().sort({ createdAt: -1 });
      res.json(clothes);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  create: (async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng upload ảnh' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      console.log('File uploaded:', req.file);
      console.log('Image URL:', imageUrl);

      const newClothes = new Clothes({
        name: req.body.name,
        ownerName: req.body.ownerName,
        rentalPrice: Number(req.body.rentalPrice),
        description: req.body.description,
        image: imageUrl,
        status: 'available'
      });

      console.log('Saving clothes:', newClothes);
      const savedClothes = await newClothes.save();
      console.log('Saved clothes:', savedClothes);

      res.status(201).json({
        ...savedClothes.toObject(),
        image: `http://localhost:5001${imageUrl}`
      });

    } catch (error: any) {
      console.error('Error creating clothes:', error);
      if (req.file) {
        const filePath = path.join(process.cwd(), 'backend', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.status(500).json({ 
        message: 'Lỗi khi lưu dữ liệu',
        error: error.message 
      });
    }
  }) as RequestHandler,

  update: (async (req, res) => {
    try {
      const oldClothes = await Clothes.findById(req.params.id);
      if (!oldClothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      const updateData: UpdateData = {
        name: req.body.name,
        ownerName: req.body.ownerName,
        rentalPrice: Number(req.body.rentalPrice),
        description: req.body.description
      };

      if (req.file) {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(oldClothes.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updatedClothes = await Clothes.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedClothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      res.json({
        ...updatedClothes.toObject(),
        image: `http://localhost:5001${updatedClothes.image}`
      });

    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  }) as RequestHandler,

  delete: (async (req, res) => {
    try {
      const clothes = await Clothes.findById(req.params.id);
      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy' });
      }

      const imagePath = path.join(__dirname, '../../uploads', path.basename(clothes.image));
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error('Lỗi khi xóa file:', error);
      }

      await clothes.deleteOne();
      res.json({ message: 'Đã xóa thành công' });

    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      res.status(500).json({ message: 'Lỗi server khi xóa dữ liệu' });
    }
  }) as RequestHandler
};