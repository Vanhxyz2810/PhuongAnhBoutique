import axios from 'axios';
import FormData from 'form-data';
import { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';

interface CCCDInfo {
  cccd: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  queQuan: string;
  noiThuongTru: string;
}

export async function extractCCCDInfo(file: Express.Multer.File): Promise<CCCDInfo | null> {
  try {
    console.log('=== CCCD EXTRACTION START ===');
    console.log('File info:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Tạo thư mục temp nếu chưa tồn tại
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Tạo temporary file
    const tempPath = path.join(tempDir, file.originalname);
    fs.writeFileSync(tempPath, file.buffer);

    const formData = new FormData();
    formData.append('image', fs.createReadStream(tempPath));

    const response = await axios.post('http://103.169.34.130:9898/extract', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Xóa file tạm sau khi dùng xong
    fs.unlinkSync(tempPath);

    console.log('OCR API Response:', response.data);
    return response.data;

  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('=== CCCD EXTRACTION ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
    } else {
      console.error('Unknown error:', error);
    }
    return null;
  }
} 