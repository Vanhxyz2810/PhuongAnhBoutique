import { Request, Response, RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Session } from '../models/Session';

const userRepository = AppDataSource.getRepository(User);
const sessionRepository = AppDataSource.getRepository(Session);
const JWT_SECRET = process.env.JWT_SECRET || 'pa-boutique-secret-key-2024';

export class AuthController {
  static register = (async (req: Request, res: Response) => {
    try {
      const { name, phone, password } = req.body;
      
      // Kiểm tra số điện thoại đã tồn tại
      const existingUser = await AppDataSource.getRepository(User).findOne({ 
        where: { phone } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác.'
        });
      }
      
      // Tạo user mới
      const user = new User();
      user.name = name;
      user.phone = phone;
      user.password = await bcrypt.hash(password, 10);
      user.role = 'customer'; // Đảm bảo set role
      
      await AppDataSource.getRepository(User).save(user);

      // Tạo token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'pa-boutique-secret-key-2024',
        { expiresIn: '1d' }
      );

      // Trả về cả token và thông tin user
      res.json({
        message: 'Đăng ký thành công',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (err) {
      const error = err as any; // Add type assertion
      console.error('Register error:', error);
      // Xử lý các lỗi cụ thể
      if (error.code === '23505') {
        res.status(400).json({
          message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác.'
        });
      } else {
        res.status(500).json({
          message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
        });
      }
    }
  }) as RequestHandler;

  static login = (async (req: Request, res: Response) => {
    try {
      const { phone, password } = req.body;
      const user = await userRepository.findOne({ where: { phone } });
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
      }

      // Tạo token mới
      const token = jwt.sign(
        { 
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role 
        },
        process.env.JWT_SECRET || 'pa-boutique-secret-key-2024',
        { expiresIn: '30d' }
      );

      // Lưu session vào database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Hết hạn sau 30 ngày

      const session = sessionRepository.create({
        token,
        userId: user.id,
        expiresAt
      });
      await sessionRepository.save(session);

      res.json({
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler;

  static logout = (async (req: Request, res: Response) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        // Vô hiệu hóa session
        await sessionRepository.update(
          { token },
          { isValid: false }
        );
      }
      res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler;

  static getProfile = (async (req: Request, res: Response) => {
    try {
      const user = await userRepository.findOne({ 
        where: { id: (req as any).user.id },
        select: ['id', 'phone', 'name']
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler;
} 