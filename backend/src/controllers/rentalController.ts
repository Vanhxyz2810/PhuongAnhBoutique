import { Request, Response, RequestHandler } from 'express';
import { Rental, RentalStatus } from '../models/Rental';
import { Clothes } from '../models/Clothes';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/database';
import { generateOrderCode } from '../utils/orderCode';
import { AuthRequest } from '../types';
import payos from '../config/payos';
import { Not, In } from 'typeorm';
import { uploadToCloudinary } from '../middleware/uploadToCloud';

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
  create: async (req: AuthRequest, res: Response) => {
    try {
      const rentalData = req.body;
      const file = req.file;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Kiểm tra sản phẩm có tồn tại không
      const clothes = await clothesRepository.findOne({
        where: { id: rentalData.clothesId }
      });

      if (!clothes) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }

      // Upload CCCD to Cloudinary if provided
      let identityCardUrl = '';
      if (file) {
        try {
          identityCardUrl = await uploadToCloudinary(file, 'identity_cards');
        } catch (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Lỗi khi tải lên CCCD' });
        }
      }

      // Tạo mã đơn hàng
      const orderCode = generateOrderCode();
      
      // Tạo URL thanh toán PayOS
      const amount = Number(rentalData.totalAmount);

      const paymentData = {
        orderCode: parseInt(orderCode.replace(/\D/g, '')),
        amount,
        description: orderCode, // Chỉ dùng mã đơn hàng làm nội dung chuyển khoản
        cancelUrl: `${process.env.FRONTEND_URL}/cancel`,
        returnUrl: `${process.env.FRONTEND_URL}/success`,
        items: [{
          name: clothes.name,
          price: clothes.rentalPrice,
          quantity: 1
        }]
      };

      let paymentResponse;
      if (rentalData.paymentMethod === 'transfer') {
        paymentResponse = await payos.createPaymentLink(paymentData);

        if (!paymentResponse.checkoutUrl) {
          return res.status(400).json({ 
            message: 'Không thể tạo link thanh toán' 
          });
        }
      }

      // Lưu thông tin đơn hàng
      const tempRentalData: Partial<Rental> = {
        orderCode,
        userId: user.id,
        clothesId: clothes.id,
        customerName: rentalData.customerName,
        phone: rentalData.phone,
        rentDate: new Date(rentalData.rentDate),
        returnDate: new Date(rentalData.returnDate),
        totalAmount: amount,
        identityCard: identityCardUrl,
        status: rentalData.paymentMethod === 'cash' ? RentalStatus.PENDING : RentalStatus.PENDING_PAYMENT,
        paymentMethod: rentalData.paymentMethod,
        pickupTime: rentalData.pickupTime,
        pendingExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const rental = rentalRepository.create(tempRentalData);
      await rentalRepository.save(rental);

      // Cập nhật trạng thái quần áo nếu thanh toán tiền mặt
      if (rentalData.paymentMethod === 'cash') {
        await clothesRepository.update(clothes.id, {
          status: 'rented'
        });
      }

      // Trả về response tùy theo phương thức thanh toán
      if (rentalData.paymentMethod === 'transfer' && paymentResponse?.checkoutUrl) {
        res.json({
          orderCode,
          paymentUrl: paymentResponse.checkoutUrl
        });
      } else {
        res.json({
          orderCode,
          message: 'Đặt hàng thành công'
        });
      }

    } catch (error) {
      console.error('Error creating rental:', error);
      if (req.file) {
        // Xóa file nếu có lỗi
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const rentals = await rentalRepository.find({
        relations: ['clothes'],
        select: {
          id: true,
          orderCode: true,
          customerName: true,
          phone: true,
          rentDate: true,
          returnDate: true,
          totalAmount: true,
          status: true,
          identityCard: true,
          clothes: {
            id: true,
            name: true,
            image: true
          }
        }
      });

      console.log('Rentals with identity cards:', rentals);
      res.json(rentals);
    } catch (error) {
      console.error('Error getting rentals:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

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
            approvedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }) 
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
            completedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
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
            rejectedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
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

  getMyRentals: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const rentals = await rentalRepository.find({
        where: {
          userId: req.user.id,
          status: Not(RentalStatus.PENDING_PAYMENT)
        },
        relations: ['clothes'],
        order: { createdAt: 'DESC' }
      });

      res.json(rentals);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

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
          { status: RentalStatus.APPROVED }
        );
      } else if (status === 'CANCELLED') {
        const rental = await rentalRepository.findOne({ where: { orderCode } });
        if (rental) {
          await rentalRepository.update(rental.id, { status: RentalStatus.REJECTED });
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

      // Nếu đơn hàng không phải đang chờ thanh toán thì trả về status luôn
      if (rental.status !== RentalStatus.PENDING_PAYMENT) {
        return res.json({ status: rental.status });
      }

      // Kiểm tra xem QR code có hết hạn chưa
      if (rental.expireAt && new Date() > rental.expireAt) {
        await rentalRepository.update(rental.id, { status: RentalStatus.REJECTED });
        await clothesRepository.update(rental.clothesId, { status: 'available' });
        return res.json({ status: RentalStatus.REJECTED, message: 'QR code đã hết hạn' });
      }

      // Kiểm tra giao dịch ngân hàng
      const isTransactionSuccess = await checkBankTransaction(orderCode);
      if (isTransactionSuccess) {
        await rentalRepository.update(rental.id, { status: RentalStatus.APPROVED });
        return res.json({ status: RentalStatus.APPROVED });
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

      // Cập nhật trạng thái đơn hàng
      rental.status = RentalStatus.APPROVED;
      await rentalRepository.save(rental);

      // Cập nhật trạng thái sản phẩm
      if (rental.clothes) {
        rental.clothes.status = 'rented';
        await clothesRepository.save(rental.clothes);
      }

      res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  getRentalByOrderCode: async (req: Request, res: Response) => {
    try {
      const { orderCode } = req.params;
      console.log('=== GET RENTAL BY ORDER CODE ===');
      console.log('orderCode:', orderCode);

      const rental = await rentalRepository.findOne({
        where: { orderCode },
        relations: ['clothes']
      });

      console.log('Found rental:', rental);

      if (!rental) {
        console.log('Rental not found');
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      // Trả về dữ liệu cần thiết
      const response = {
        orderCode: rental.orderCode,
        amount: rental.totalAmount,
        status: rental.status,
        clothesName: rental.clothes?.name
      };
      console.log('Sending response:', response);

      res.json(response);
    } catch (error) {
      console.error('Error getting rental:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  updatePaymentStatus: async (req: Request, res: Response) => {
    try {
      const { orderCode } = req.params;
      const { status } = req.body;

      const rental = await rentalRepository.findOne({
        where: { orderCode },
        relations: ['clothes']
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
      }

      // Cập nhật trạng thái đơn thuê
      rental.status = status === 'cancelled' ? RentalStatus.CANCELLED : RentalStatus.APPROVED;
      await rentalRepository.save(rental);

      // Nếu thanh toán thành công thì cập nhật trạng thái quần áo
      if (rental.status === RentalStatus.APPROVED && rental.clothes) {
        rental.clothes.status = 'rented';
        await clothesRepository.save(rental.clothes);
      }

      res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  deleteRental: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const rental = await rentalRepository.findOne({
        where: { id: Number(id) },
        relations: ['clothes']
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn thuê' });
      }

      // Nếu đơn đang được thuê thì không cho xóa
      if (rental.status === RentalStatus.APPROVED) {
        return res.status(400).json({ 
          message: 'Không thể xóa đơn đang được thuê' 
        });
      }

      // Xóa đơn thuê
      await rentalRepository.remove(rental);

      res.json({ message: 'Đã xóa đơn thuê thành công' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  getRentalDates: async (req: Request, res: Response) => {
    try {
      const { clothesId } = req.params;
      console.log('Getting booked dates for clothes:', clothesId);
      
      // Kiểm tra xem clothesId có tồn tại không
      const clothes = await clothesRepository.findOne({
        where: { id: clothesId }
      });

      if (!clothes) {
        return res.status(404).json({ 
          message: 'Không tìm thấy sản phẩm' 
        });
      }
      
      const rentals = await rentalRepository.find({
        where: {
          clothesId,
          status: In([RentalStatus.APPROVED, RentalStatus.PENDING, RentalStatus.PENDING_PAYMENT]),
        }
      });

      console.log('Found rentals:', rentals);

      const bookedDates = rentals.map(rental => ({
        start: rental.rentDate,
        end: rental.returnDate
      }));

      return res.json(bookedDates);
    } catch (error) {
      console.error('Error getting rental dates:', error);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Thêm endpoint xử lý feedback
  submitFeedback: async (req: Request, res: Response) => {
    try {
      const { orderId, rating, message, images } = req.body;

      const rental = await rentalRepository.findOne({
        where: { id: orderId }
      });

      if (!rental) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
      }

      if (rental.hasFeedback) {
        return res.status(400).json({ message: 'Đơn hàng đã được đánh giá' });
      }

      // Cập nhật feedback
      await rentalRepository.update(orderId, {
        hasFeedback: true,
        rating,
        feedbackMessage: message,
        feedbackImages: images,
        feedbackAt: new Date()
      });

      res.json({ message: 'Cảm ơn bạn đã gửi đánh giá!' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Thêm endpoint lấy tất cả feedback cho admin
  getAllFeedbacks: async (_req: Request, res: Response) => {
    try {
      const feedbacks = await rentalRepository.find({
        where: { hasFeedback: true },
        relations: ['clothes'],
        order: { feedbackAt: 'DESC' }
      });
      res.json(feedbacks);
    } catch (error) {
      console.error('Error getting feedbacks:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },
}; 