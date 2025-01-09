import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
const clothesRoutes = require('./routes/clothes');
const customerRoutes = require('./routes/customers');
const rentalRoutes = require('./routes/rentals');

app.use('/api/clothes', clothesRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
