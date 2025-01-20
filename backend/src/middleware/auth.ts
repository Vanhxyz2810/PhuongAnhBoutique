import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    phone: string;
    role: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth Middleware - JWT_SECRET:', process.env.JWT_SECRET);
    console.log('Auth Middleware - Received token:', token);

    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({ message: 'Token không tồn tại' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        name: string;
        phone: string;
        role: string;
      };
      console.log('Auth Middleware - Decoded token:', decoded);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('Auth Middleware - JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  } catch (error) {
    console.error('Auth Middleware - General error:', error);
    res.status(401).json({ message: 'Vui lòng đăng nhập' });
  }
}; 