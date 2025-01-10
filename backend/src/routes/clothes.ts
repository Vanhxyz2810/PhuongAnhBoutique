import { Router } from 'express';
import { clothesController } from '../controllers/clothesController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', clothesController.getAll);
router.post('/', upload.single('image'), clothesController.create);
router.put('/:id', upload.single('image'), clothesController.update);
router.delete('/:id', clothesController.delete);

export default router; 