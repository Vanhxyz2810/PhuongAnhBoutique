import express from 'express';
import { clothesController } from '../controllers/clothesController';

const router = express.Router();

router.get('/', clothesController.getAll);
router.post('/', clothesController.create);

module.exports = router; 