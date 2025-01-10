import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/clothes_rental', {
      // Thêm các options nếu cần
    });
    console.log('MongoDB đã kết nối thành công');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
}; 