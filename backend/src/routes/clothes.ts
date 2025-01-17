import express from 'express';
import clothesController from '../controllers/clothesController';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'backend', 'uploads'));
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', clothesController.getAll);
router.post('/', upload.single('image'), clothesController.create);
router.put('/:id', upload.single('image'), clothesController.update);
router.delete('/:id', clothesController.delete);

export default router; 