import { memo, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CloudUpload } from '@mui/icons-material';
import { Product } from '../types';
import axiosInstance from '../utils/axios';

interface RentalFormProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  formData: {
    customerName: string;
    phone: string;
    identityCard: File | null;
    rentDate: Date | null;
    returnDate: Date | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    customerName: string;
    phone: string;
    identityCard: File | null;
    rentDate: Date | null;
    returnDate: Date | null;
  }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "identityCard" | "studentCard") => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPhoneValid: boolean;
  onUploadClick: () => void;
  onPrivacyAccept: () => void;
  showPayment: boolean;
  paymentInfo: {
    qrCode?: string;
    orderCode?: string;
    expireTime?: number;
    paymentUrl?: string;
    qrCodeUrl?: string;
  };
  calculateTotal: () => number;
}

const RentalForm = memo(({ 
  open, 
  onClose,
  formData,
  setFormData,
  onSubmit,
  onFileChange,
  onPhoneChange,
  isPhoneValid,
  onUploadClick,
  showPayment,
  paymentInfo,
  calculateTotal
}: RentalFormProps) => {
  useEffect(() => {
    if (!showPayment || !paymentInfo.orderCode) return;

    if (paymentInfo.paymentUrl) {
      window.location.href = paymentInfo.paymentUrl;
      return;
    }

    let attempts = 0;
    const maxAttempts = 6;
    
    const checkInterval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/rentals/check-payment/${paymentInfo.orderCode}`);
        
        if (response.data.status === 'approved') {
          clearInterval(checkInterval);
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [showPayment, paymentInfo]);

  const renderPaymentSection = () => {
    if (!paymentInfo.qrCodeUrl) return null;

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quét mã QR để thanh toán
        </Typography>
        <img 
          src={paymentInfo.qrCodeUrl} 
          alt="Payment QR"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <Typography sx={{ mt: 2 }}>
          Mã đơn hàng: {paymentInfo.orderCode}
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
          Vui lòng giữ màn hình này mở trong khi thanh toán
        </Typography>
        <Typography sx={{ mt: 1, color: 'primary.main' }}>
          Hệ thống sẽ tự động xác nhận khi bạn thanh toán thành công
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {showPayment ? 'Thanh toán' : 'Thông tin thuê đồ'}
      </DialogTitle>

      {!showPayment ? (
        <form onSubmit={onSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Họ và tên"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                customerName: e.target.value
              }))}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phone}
              onChange={onPhoneChange}
              margin="normal"
              required
              error={!isPhoneValid && formData.phone !== ''}
              helperText={!isPhoneValid && formData.phone !== '' ? 'Số điện thoại không hợp lệ' : ''}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày thuê"
                value={formData.rentDate}
                onChange={(date) => setFormData(prev => ({
                  ...prev,
                  rentDate: date
                }))}
                minDate={new Date()}
              />
              <DatePicker
                label="Ngày trả"
                value={formData.returnDate}
                onChange={(date) => setFormData(prev => ({
                  ...prev,
                  returnDate: date
                }))}
                minDate={formData.rentDate || new Date()}
              />
            </LocalizationProvider>

            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={onUploadClick}
              sx={{ mt: 2 }}
            >
              Tải lên CCCD hoặc Thẻ sinh viên
            </Button>

            <input
              id="cccd-upload"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => onFileChange(e, "identityCard")}
            />

            {formData.identityCard && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {formData.identityCard.name}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                Tổng tiền: {calculateTotal().toLocaleString()}đ
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!isPhoneValid || !formData.customerName || !formData.rentDate || !formData.returnDate}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </form>
      ) : (
        <DialogContent>
          {renderPaymentSection()}
        </DialogContent>
      )}
    </Dialog>
  );
});

export default RentalForm; 