import express from 'express';
import { Rental } from '../models/Rental';

const router = express.Router();

// GET all rentals
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('clothesId')
      .populate('customerId');
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new rental
router.post('/', async (req, res) => {
  try {
    const newRental = new Rental(req.body);
    const savedRental = await newRental.save();
    res.status(201).json(savedRental);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

module.exports = router; 