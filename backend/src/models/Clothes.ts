import { Schema, model } from 'mongoose';

interface IClothes {
  name: string;
  ownerName: string;
  rentalPrice: number;
  status: 'available' | 'rented';
  image: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clothesSchema = new Schema<IClothes>({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  rentalPrice: { type: Number, required: true },
  status: { type: String, enum: ['available', 'rented'], default: 'available' },
  image: { type: String, required: true },
  description: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Thêm virtual field để lấy URL đầy đủ của ảnh
clothesSchema.virtual('imageUrl').get(function() {
  return `http://localhost:5001${this.image}`;
});

export const Clothes = model<IClothes>('Clothes', clothesSchema); 