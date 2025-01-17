import express from 'express';
import rentalController from '../controllers/rentalController';
import { uploadIdentity } from '../middleware/uploadIdentity';

const router = express.Router();

router.post('/', uploadIdentity.single('identityCard'), rentalController.create);
router.get('/', rentalController.getAll);
router.patch('/:id/payment-status', rentalController.updatePaymentStatus);

export default router; 