import { AppDataSource } from "./config/database";
import { Clothes } from "./models/Clothes";

const seedData = async () => {
  try {
    await AppDataSource.initialize();
    const clothesRepository = AppDataSource.getRepository(Clothes);

    // Tạo một số dữ liệu mẫu
    const sampleClothes = [
      {
        name: 'Váy hoa dài',
        ownerName: 'Shop',
        rentalPrice: 200000,
        status: 'available',
        image: '/uploads/sample1.jpg',
        description: 'Váy hoa dài phong cách'
      },
      {
        name: 'Áo dài truyền thống',
        ownerName: 'Shop',
        rentalPrice: 300000,
        status: 'available',
        image: '/uploads/sample2.jpg',
        description: 'Áo dài truyền thống màu đỏ'
      }
    ];

    await clothesRepository.clear(); // Xóa dữ liệu cũ
    await clothesRepository.save(sampleClothes as any);

    console.log('Đã thêm dữ liệu mẫu thành công');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu mẫu:', error);
    process.exit(1);
  }
};

seedData(); 