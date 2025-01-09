import express from 'express';
import { Customer } from '../models/Customer';

const router = express.Router();

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new customer
router.post('/', async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

module.exports = router; 