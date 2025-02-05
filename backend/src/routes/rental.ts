import express, { RequestHandler } from 'express';
import rentalController from '../controllers/rentalController';
import { uploadIdentity } from '../middleware/uploadIdentity';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Routes cho khách hàng
router.post('/', auth as RequestHandler, uploadIdentity.single('identityCard'), rentalController.create);
router.get('/my-rentals', auth as RequestHandler, rentalController.getMyRentals as RequestHandler);

// Public routes - đặt trước các routes khác
router.get('/by-order-code/:orderCode', rentalController.getRentalByOrderCode);
router.get('/check-payment/:orderCode', rentalController.checkPaymentStatus);
router.post('/webhook', rentalController.handlePaymentWebhook);
router.post('/updatePayment/:orderCode', rentalController.updatePayment); 

// Routes cho admin
router.get('/', auth as RequestHandler, checkRole(['admin']) as RequestHandler, rentalController.getAll as RequestHandler);
router.put('/:id/status', auth as RequestHandler, checkRole(['admin']) as RequestHandler, rentalController.updateStatus as RequestHandler);
router.delete('/:id', auth as RequestHandler, checkRole(['admin']) as RequestHandler, rentalController.deleteRental as RequestHandler);

router.get('/booked-dates/:clothesId', rentalController.getRentalDates);

export default router; 