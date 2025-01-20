import multer from 'multer';
import { Request } from 'express';

export interface MulterRequest extends Request {
  file?: Express.Multer.File | undefined;
} 