import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY
});

export const uploadToCloudinary = async (file: Express.Multer.File, folder: string = 'uploads') => {
  try {
    // Kiểm tra nếu file có buffer (từ multer memoryStorage)
    if (file.buffer) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder
      });
      return result.secure_url;
    }
    
    // Nếu file có path (từ multer diskStorage)
    if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder
      });
      return result.secure_url;
    }

    throw new Error('Invalid file format');
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 