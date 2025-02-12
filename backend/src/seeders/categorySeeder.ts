import { AppDataSource } from '../config/database';
import { Category } from '../models/Category';

const defaultCategories = [
  'Váy',
  'Áo dài',
  'Đầm',
  'Bikini',
  'Vest',
  'Áo cưới',
  'Hanbok',
  'Kimono'
];

export const seedCategories = async () => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    
    // Kiểm tra xem đã có categories chưa
    const existingCount = await categoryRepository.count();
    
    if (existingCount === 0) {
      console.log('Seeding categories...');
      
      // Tạo các categories mặc định
      const categories = defaultCategories.map(name => {
        return categoryRepository.create({ name });
      });
      
      await categoryRepository.save(categories);
      console.log('✅ Categories seeded successfully');
    } else {
      console.log('Categories already exist, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}; 