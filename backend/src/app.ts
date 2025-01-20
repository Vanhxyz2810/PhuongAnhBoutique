import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import clothesRouter from './routes/clothes';
import rentalRouter from './routes/rental';
import { connectDB } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clothes', clothesRouter);
app.use('/api/rentals', rentalRouter);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 