import express, { Response, NextFunction } from 'express';
import clothesController from '../controllers/clothesController';
import { uploadClothes } from '../middleware/uploadClothes';
import { MulterRequest } from '../config/multer';

const router = express.Router();

// Routes
router.get('/', clothesController.getAll);
router.post('/', uploadClothes.single('image'), (req: MulterRequest, res: Response, next: NextFunction) => {
  clothesController.create(req, res, next);
});
router.put('/:id', uploadClothes.single('image'), (req: MulterRequest, res: Response, next: NextFunction) => {
  clothesController.update(req, res, next);
});
router.delete('/:id', clothesController.delete);
router.get('/:id', clothesController.getClothesById);

export default router; 