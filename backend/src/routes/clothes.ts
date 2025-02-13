import express, { Response, NextFunction } from 'express';
import clothesController from '../controllers/clothesController';
import { uploadClothes } from '../middleware/uploadClothes';
import { MulterRequest } from '../config/multer';
import { auth } from '../middleware/auth';

const router = express.Router();

// Category routes - đặt trước routes có :id để tránh conflict
router.get('/categories/all', clothesController.getAllCategories);
router.post('/categories', auth, clothesController.createCategory);
router.delete('/categories/:id', auth, clothesController.deleteCategory);

// Clothes routes
router.get('/', clothesController.getAll);
router.post('/', auth, uploadClothes.array('images', 5), (req: MulterRequest, res: Response, next: NextFunction) => {
  clothesController.create(req, res, next);
});
router.put('/:id', auth, uploadClothes.array('images', 5), (req: MulterRequest, res: Response, next: NextFunction) => {
  clothesController.update(req, res, next);
});
router.delete('/:id', auth, clothesController.delete);
router.get('/:id', clothesController.getClothesById);
router.patch('/:id/toggle-pin', auth, clothesController.togglePin);

export default router; 