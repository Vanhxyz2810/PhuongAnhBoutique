import express, { RequestHandler } from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register as RequestHandler);
router.post('/login', AuthController.login as RequestHandler);

// Protected routes
router.post('/logout', auth as RequestHandler, AuthController.logout as RequestHandler);
router.get('/profile', auth as RequestHandler, AuthController.getProfile as RequestHandler);

export default router;