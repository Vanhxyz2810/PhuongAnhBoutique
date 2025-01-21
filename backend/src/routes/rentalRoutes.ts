import express from 'express';
import rentalController from '../controllers/rentalController';
import { auth } from '../middleware/auth';
import upload from '../config/multer';

const router = express.Router();

router.post('/', auth, upload.single('identityCard'), rentalController.create);
router.get('/check-payment/:orderCode', rentalController.checkPaymentStatus);
router.get('/user/:phone', rentalController.getByPhone);
router.get('/my-rentals', auth, rentalController.getMyRentals);
router.post('/webhook', rentalController.handlePaymentWebhook);
// ... other routes

export default router; 