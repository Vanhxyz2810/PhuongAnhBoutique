import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  clothesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothes',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

export const Rental = mongoose.model('Rental', rentalSchema); 