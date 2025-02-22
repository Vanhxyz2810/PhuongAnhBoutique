import express, { RequestHandler } from 'express';
import rentalController from '../controllers/rentalController';
import { uploadIdentity } from '../middleware/uploadIdentity';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { uploadCCCD } from '../middleware/uploadClothes';

const router = express.Router();

// Thêm middleware để log
router.use((req, res, next) => {
  console.log('Rental route:', req.method, req.path);
  next();
});

// Public routes - đặt trước các routes khác
router.put('/cancel/:orderCode', rentalController.cancelRental);
router.get('/booked-dates/:clothesId', rentalController.getRentalDates);
router.get('/by-order-code/:orderCode', rentalController.getRentalByOrderCode);
router.get('/check-payment/:orderCode', rentalController.checkPaymentStatus);
router.post('/webhook', rentalController.handlePaymentWebhook);

// Routes cần auth
router.use(auth as RequestHandler);

// Routes cho khách hàng
router.post('/', uploadCCCD.single('identityCard'), rentalController.create);
router.get('/my-rentals', rentalController.getMyRentals as RequestHandler);

// Routes cho admin
router.get('/', checkRole(['admin']) as RequestHandler, rentalController.getAll as RequestHandler);
router.post('/updatePayment/:orderCode', rentalController.updatePayment);
router.put('/:id/status', checkRole(['admin']) as RequestHandler, rentalController.updateStatus as RequestHandler);
router.delete('/:id', checkRole(['admin']) as RequestHandler, rentalController.deleteRental as RequestHandler);
router.post('/feedback', rentalController.submitFeedback);
router.get('/feedbacks', checkRole(['admin']) as RequestHandler, rentalController.getAllFeedbacks as RequestHandler);

export default router; 