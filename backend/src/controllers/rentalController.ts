import { Request, Response, RequestHandler } from 'express';
import { Rental } from '../models/Rental';
import { Clothes } from '../models/Clothes';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';
import { generateOrderCode } from '../utils/orderCode';
import { AuthRequest } from '../types';
import payos from '../config/payos';

const rentalRepository = AppDataSource.getRepository(Rental);
const clothesRepository = AppDataSource.getRepository(Clothes);

const BANK_ID = "970422"; // ID ngân hàng của bạn
const ACCOUNT_NO = "3001102007"; // Số tài khoản của bạn
const TEMPLATE = "fypnK7r";
const QR_EXPIRE_MINUTES = 15; // QR hết hạn sau 15 phút

interface PayOSError extends Error {
  response?: {
    data: any;
    status: number;
  };
}

const generateVietQRUrl = (amount: number, orderCode: string) => {
  return `https://img.vietqr.io/image/vietinbank-113366668888-compact2.jpg?amount=${amount}&addInfo=${orderCode}`;
};

// Thêm hàm để kiểm tra giao dịch ngân hàng
const checkBankTransaction = async (orderCode: string): Promise<boolean> => {
  try {
    // TODO: Implement actual bank transaction check
    // Đây là nơi bạn sẽ tích hợp API của ngân hàng để kiểm tra giao dịch
    return false;
  } catch (error) {
    console.error('Error checking bank transaction:', error);
    return false;
  }
};

export default {
  create: (async (req: AuthRequest, res: Response) => {
    try {
      // Log request data
      console.log('=== START CREATE RENTAL ===');
      console.log('Request body:', req.body);
      console.log('Total amount:', req.body.totalAmount);

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

      // Tạo PayOS payment link
      const paymentData = {
        orderCode: parseInt(orderCode.replace(/\D/g, '')),
        amount: Number(totalAmount),
        description: `Thuê đồ - ${orderCode}`,
        cancelUrl: `${process.env.FRONTEND_URL}/cancel-payment`,
        returnUrl: `${process.env.FRONTEND_URL}/rental-success`,
        items: [{
          name: clothes.name,
          quantity: 1,
          price: Number(totalAmount)
        }],
        currency: 'VND'
      };

      console.log('=== PAYMENT DATA ===');
      console.log(JSON.stringify(paymentData, null, 2));

      try {
        const paymentLinkResponse = await payos.createPaymentLink(paymentData);
        console.log('=== PAYOS RESPONSE ===');
        console.log(JSON.stringify(paymentLinkResponse, null, 2));

        if (!paymentLinkResponse?.checkoutUrl) {
          // Nếu không có checkoutUrl, tạo QR code thanh toán
          const qrUrl = generateVietQRUrl(Number(totalAmount), orderCode);
          const expireAt = Date.now() + QR_EXPIRE_MINUTES * 60 * 1000;

          // Lưu đơn hàng với QR code
          const rental = rentalRepository.create({
            orderCode,
            customerName: customerName || req.user?.name,
            phone: phone || req.user?.phone,
            identityCard: req.file ? `/uploads/identity/${req.file.filename}` : '',
            rentDate: new Date(rentDate),
            returnDate: new Date(returnDate),
            totalAmount: Number(totalAmount),
            clothesId: clothesId,
            paymentQR: qrUrl,
            expireAt: new Date(expireAt),
            status: 'pending',
            userId: req.user?.id
          });

          await rentalRepository.save(rental);
          await clothesRepository.update(clothesId, { status: 'pending' });

          return res.status(201).json({
            message: 'Tạo đơn thuê thành công',
            orderCode: rental.orderCode,
            paymentQR: qrUrl,
            expireAt
          });
        }

        // Nếu có checkoutUrl, xử lý như cũ
        const rental = rentalRepository.create({
          orderCode,
          customerName: customerName || req.user?.name,
          phone: phone || req.user?.phone,
          identityCard: req.file ? `/uploads/identity/${req.file.filename}` : '',
          rentDate: new Date(rentDate),
          returnDate: new Date(returnDate),
          totalAmount: Number(totalAmount),
          clothesId: clothesId,
          paymentUrl: paymentLinkResponse.checkoutUrl,
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
          paymentUrl: paymentLinkResponse.checkoutUrl
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('=== PAYOS ERROR ===');
          console.error('Error:', error);
          console.error('Stack:', error.stack);
        }
        throw error;
      }
    } catch (error: any) {
      console.error('=== RENTAL CREATION ERROR ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        message: 'Không thể tạo link thanh toán',
        error: error.message 
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
  }) as RequestHandler,

  // Webhook để nhận kết quả thanh toán
  handlePaymentWebhook: (async (req: Request, res: Response) => {
    try {
      const isValidSignature = payos.verifyPaymentWebhookData(req.body);
      if (!isValidSignature) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      const { orderCode, status } = req.body;
      
      if (status === 'PAID') {
        await rentalRepository.update(
          { orderCode },
          { status: 'approved' }
        );
      } else if (status === 'CANCELLED') {
        const rental = await rentalRepository.findOne({ where: { orderCode } });
        if (rental) {
          await rentalRepository.update(rental.id, { status: 'rejected' });
          await clothesRepository.update(rental.clothesId, { status: 'available' });
        }
      }

      res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Payment webhook error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }) as RequestHandler,

  checkPaymentStatus: (async (req: Request, res: Response) => {
    try {
      const { orderCode } = req.params;
      const rental = await rentalRepository.findOne({ 
        where: { orderCode }
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      // Nếu đơn hàng đã approved hoặc rejected thì trả về status luôn
      if (rental.status !== 'pending') {
        return res.json({ status: rental.status });
      }

      // Kiểm tra xem QR code có hết hạn chưa
      if (rental.expireAt && new Date() > rental.expireAt) {
        await rentalRepository.update(rental.id, { status: 'rejected' });
        await clothesRepository.update(rental.clothesId, { status: 'available' });
        return res.json({ status: 'rejected', message: 'QR code đã hết hạn' });
      }

      // Kiểm tra giao dịch ngân hàng
      const isTransactionSuccess = await checkBankTransaction(orderCode);
      if (isTransactionSuccess) {
        await rentalRepository.update(rental.id, { status: 'approved' });
        return res.json({ status: 'approved' });
      }

      res.json({ status: rental.status });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }) as RequestHandler,

  getById: (async (req: Request, res: Response) => {
    try {
      const rental = await rentalRepository.findOne({
        where: { id: parseInt(req.params.id) },
        relations: ['clothes']
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
      }

      res.json(rental);
    } catch (error) {
      console.error('Error getting rental:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }) as RequestHandler,

  updatePayment: async (req: Request, res: Response) => {
    try {
      const { orderCode } = req.params;
      const { status } = req.body;

      const rental = await rentalRepository.findOne({
        where: { orderCode },
        relations: ['clothes']
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      rental.status = status;
      if (status === 'PAID') {
        rental.approvedAt = new Date();
      }

      await rentalRepository.save(rental);

      res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
}; 