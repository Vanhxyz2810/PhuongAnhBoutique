import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  identityCard: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const Customer = mongoose.model('Customer', customerSchema); 