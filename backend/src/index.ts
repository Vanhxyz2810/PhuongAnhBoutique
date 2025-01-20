import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.vercel.app']
    : 'http://localhost:5173',
  credentials: true
})); 