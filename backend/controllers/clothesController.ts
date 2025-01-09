import { Request, Response } from 'express';
import { Clothes } from '../models/Clothes';

export const clothesController = {
  // Lấy tất cả quần áo
  getAll: async (req: Request, res: Response) => {
    try {
      const clothes = await Clothes.find();
      res.json(clothes);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Thêm quần áo mới
  create: async (req: Request, res: Response) => {
    try {
      const newClothes = new Clothes(req.body);
      const savedClothes = await newClothes.save();
      res.status(201).json(savedClothes);
    } catch (error) {
      res.status(400).json({ message: 'Invalid data' });
    }
  }
}; 