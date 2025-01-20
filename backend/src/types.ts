import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    phone: string;
    role: string;
  };
} 