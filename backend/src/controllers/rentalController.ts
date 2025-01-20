import { Request, Response, RequestHandler } from 'express';
import { Rental } from '../models/Rental';
import { Clothes } from '../models/Clothes';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';
import { generateOrderCode } from '../utils/orderCode';
import { AuthRequest } from '../types';

const rentalRepository = AppDataSource.getRepository(Rental);
const clothesRepository = AppDataSource.getRepository(Clothes);

const BANK_ID = "970422"; // ID ngân hàng của bạn
const ACCOUNT_NO = "3001102007"; // Số tài khoản của bạn
const TEMPLATE = "fypnK7r";
const QR_EXPIRE_MINUTES = 15; // QR hết hạn sau 15 phút

export default {
  create: (async (req: AuthRequest, res: Response) => {
    try {
      console.log('Create rental - Request body:', req.body);
      console.log('Create rental - Request user:', req.user);
      console.log('Create rental - Request file:', req.file);

      const orderCode = generateOrderCode();
      const {
        customerName,
        phone,
        rentDate,
        returnDate,
        totalAmount,
        clothesId
      } = req.body;

      // Kiểm tra xem quần áo có tồn tại không
      const clothes = await clothesRepository.findOne({
        where: { id: clothesId }
      });

      console.log('Found clothes:', clothes);

      if (!clothes) {
        return res.status(404).json({
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Kiểm tra trạng thái quần áo
      console.log('Clothes status:', clothes.status);

      // Kiểm tra xem có đơn thuê pending nào không
      const pendingRental = await rentalRepository.findOne({
        where: {
          clothesId: clothesId,
          status: 'pending'
        }
      });

      console.log('Pending rental:', pendingRental);

      if (pendingRental) {
        return res.status(400).json({
          message: 'Sản phẩm này đang có người đặt thuê, vui lòng chọn sản phẩm khác hoặc thử lại sau',
          pendingUntil: pendingRental.createdAt
        });
      }

      if (clothes.status !== 'available') {
        return res.status(400).json({
          message: `Sản phẩm này hiện không khả dụng (${clothes.status})`
        });
      }

      // Tạo QR code thanh toán
      const expireAt = new Date();
      expireAt.setMinutes(expireAt.getMinutes() + QR_EXPIRE_MINUTES);
      
      const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${totalAmount}&addInfo=${orderCode}&expire=${expireAt.getTime()}`;

      // Lưu ảnh CCCD nếu có
      let identityCardPath = '';
      if (req.file) {
        identityCardPath = `/uploads/identity/${req.file.filename}`;
      }

      // Tạo đơn thuê mới
      const rental = rentalRepository.create({
        orderCode,
        customerName: customerName || req.user?.name,
        phone: phone || req.user?.phone,
        identityCard: identityCardPath,
        rentDate: new Date(rentDate),
        returnDate: new Date(returnDate),
        totalAmount: Number(totalAmount),
        clothesId: clothesId,
        paymentQR: qrUrl,
        status: 'pending',
        userId: req.user?.id
      });

      console.log('Create rental - Rental object:', rental);

      await rentalRepository.save(rental);
      console.log('Create rental - Rental saved successfully');

      await clothesRepository.update(clothesId, {
        status: 'pending'
      });

      res.status(201).json({
        message: 'Tạo đơn thuê thành công',
        orderCode: rental.orderCode,
        paymentQR: qrUrl,
        expireAt: expireAt.getTime()
      });

    } catch (error: any) {
      console.error('Error creating rental:', error);
      console.error('Error stack:', error.stack);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        message: 'Lỗi khi tạo đơn thuê',
        error: error.message,
        details: error.stack
      });
    }
  }) as RequestHandler,

  getAll: (async (_req, res) => {
    try {
      const rentals = await rentalRepository.find({
        relations: ['clothes'],
        order: { createdAt: 'DESC' }
      });

      // Format lại dữ liệu trước khi gửi về client
      const formattedRentals = rentals.map(rental => ({
        id: rental.id,
        orderCode: rental.orderCode,
        customerName: rental.customerName,
        phone: rental.phone,
        totalAmount: rental.totalAmount,
        rentDate: rental.rentDate,
        returnDate: rental.returnDate,
        status: rental.status,
        clothes: {
          id: rental.clothes.id,
          name: rental.clothes.name,
          images: [rental.clothes.image]
        }
      }));

      console.log('Fetched rentals:', formattedRentals);
      res.json(formattedRentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  updateStatus: (async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const rental = await rentalRepository.findOne({
        where: { id: Number(id) },
        relations: ['clothes']
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
      }

      // Xử lý theo từng trạng thái
      switch (status) {
        case 'approved':
          // Khi xác nhận đơn hàng
          await rentalRepository.update(id, { 
            status,
            approvedAt: new Date() 
          });
          // Cập nhật trạng thái quần áo thành đang cho thuê
          await clothesRepository.update(rental.clothesId, {
            status: 'rented'
          });
          break;

        case 'completed':
          // Khi hoàn thành đơn hàng (khách đã trả đồ)
          await rentalRepository.update(id, { 
            status,
            completedAt: new Date()
          });
          // Cập nhật trạng thái quần áo thành có sẵn
          await clothesRepository.update(rental.clothesId, {
            status: 'available'
          });
          break;

        case 'rejected':
          // Khi từ chối đơn hàng
          await rentalRepository.update(id, { 
            status,
            rejectedAt: new Date()
          });
          // Cập nhật lại trạng thái quần áo thành available
          await clothesRepository.update(rental.clothesId, {
            status: 'available'
          });
          break;

        default:
          await rentalRepository.update(id, { status });
      }

      res.json({ 
        message: `Đơn hàng đã được ${status === 'approved' ? 'xác nhận' : 
          status === 'completed' ? 'hoàn thành' : 
          status === 'rejected' ? 'từ chối' : 'cập nhật'}`
      });
    } catch (error) {
      console.error('Error updating rental status:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái' });
    }
  }) as RequestHandler,

  getByPhone: (async (req: Request, res: Response) => {
    try {
      const { phone } = req.params;
      const rentals = await rentalRepository.find({
        where: { phone },
        order: { createdAt: 'DESC' }
      });
      
      res.json(rentals);
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler,

  getMyRentals: (async (req: AuthRequest, res: Response) => {
    try {
      const rentals = await rentalRepository.find({
        where: { userId: req.user?.id },
        relations: ['clothes'],
        order: { createdAt: 'DESC' }
      });

      // Map lại response để phù hợp với frontend
      const formattedRentals = rentals.map(rental => ({
        id: rental.id,
        orderCode: rental.orderCode,
        customerName: rental.customerName,
        totalAmount: rental.totalAmount,
        rentDate: rental.rentDate,
        returnDate: rental.returnDate,
        status: rental.status,
        clothes: {
          id: rental.clothes.id,
          name: rental.clothes.name,
          images: [rental.clothes.image] // Assuming image is stored as string
        }
      }));

      res.json(formattedRentals);
    } catch (error) {
      console.error('Error fetching user rentals:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }) as RequestHandler
}; 