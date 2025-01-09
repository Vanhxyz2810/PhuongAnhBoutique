import mongoose from 'mongoose';

const clothesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  rentalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'rented'],
    default: 'available'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

export const Clothes = mongoose.model('Clothes', clothesSchema); 