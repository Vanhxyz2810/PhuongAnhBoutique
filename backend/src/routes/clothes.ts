import express from 'express';
import clothesController from '../controllers/clothesController';
import { uploadClothes } from '../middleware/uploadClothes';

const router = express.Router();

// Routes
router.get('/', clothesController.getAll);
router.post('/', uploadClothes.single('image'), clothesController.create);
router.put('/:id', uploadClothes.single('image'), clothesController.update);
router.delete('/:id', clothesController.delete);
router.get('/:id', clothesController.getClothesById);

export default router; 