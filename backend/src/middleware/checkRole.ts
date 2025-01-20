import { Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../types';

export const checkRole = (roles: string[]): RequestHandler => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.role || !roles.includes(req.user.role)) {
        res.status(403).json({ message: 'Không có quyền truy cập' });
        return;
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Vui lòng đăng nhập' });
      return;
    }
  };
}; 