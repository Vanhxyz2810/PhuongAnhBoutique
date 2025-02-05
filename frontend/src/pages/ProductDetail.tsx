import { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,


  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Snowfall from 'react-snowfall';
// import axios from 'axios';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// import { enUS } from 'date-fns/locale';
// import viLocale from 'date-fns/locale/vi';

import axiosInstance from '../utils/axios';
// import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { TextFieldProps } from '@mui/material/TextField';

// Định nghĩa theme màu sắc
const theme = {
  colors: {
    primary: '#FF90BC',      // Hồng nhạt (chủ đạo) 
    secondary: '#FFC0D9',    // Hồng nhạt hơn
    background: '#FFF5F7',   // Hồng rất nhạt
    text: '#4A4A4A',         // Xám đậm
    sale: '#FF1493',         // Hồng đậm cho giá khuyến mãi
    original: '#999',        // Xám cho giá gốc
  }
};

const images = [
  '/images/hoaDao.png',
  '/images/lixi.png',
];

const imagesLoaded = images.map(image => {
  const img = new Image();
  img.src = image;
  return img;
});

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];  // Array of image filenames
  sizes: string[];
  description: string;
  sku: string;
  status: string;
}

interface ApiError {
  message: string;
  response?: {
    data: {
      message: string;
    };
    status: number;
  };
}

// Thêm interface cho form data
interface RentalFormData {
  customerName: string;
  phone: string;
  identityCard: File | null;
  rentDate: Date | null;
  returnDate: Date | null;
}

const SnowfallEffect = memo(() => (
  <Snowfall 
    images={imagesLoaded}
    radius={[20, 30]}
    snowflakeCount={30}
    speed={[1, 3]}
    wind={[-0.5, 2]}
    rotationSpeed={[-1, 1]}
    style={{
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      opacity: 0.7
    }}
  />
));

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Tất cả hooks phải ở đây
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [openRentalForm, setOpenRentalForm] = useState(false);
  const [openPrivacyDialog, setOpenPrivacyDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<RentalFormData>({
    customerName: '',
    phone: '',
    identityCard: null,
    rentDate: null,
    returnDate: null,
  });
  const [paymentInfo, setPaymentInfo] = useState<{
    orderCode?: string;
    qrCodeUrl?: string;
  }>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<{start: string, end: string}[]>([]);

  const calculateTotal = useCallback(() => {
    if (!formData.rentDate || !formData.returnDate || !product) {
      return 0;
    }
    const days = Math.ceil((formData.returnDate.getTime() - formData.rentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * product.price;
  }, [formData.rentDate, formData.returnDate, product]);

  const handleRentClick = useCallback(() => {
    // Delay mở form để tránh blocking UI
    requestAnimationFrame(() => {
      setOpenRentalForm(true);
    });
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      if (!id) {
        setError('ID sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/clothes/${id}`);
      console.log('Product data:', response.data); // Thêm log để debug
      setProduct(response.data);
    } catch (error: unknown) {
      console.error('Error fetching product:', error);
      const apiError = error as ApiError;
      if (apiError.response) {
        console.error('Response:', apiError.response.data);
      }
      setError('Có lỗi xảy ra khi tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Thêm interval để tự động refresh status
  useEffect(() => {
    // Fetch lần đầu
    fetchProduct();

    // Tạo interval để fetch mỗi 30 giây
    const intervalId = setInterval(fetchProduct, 30000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [fetchProduct]);

  // Thêm useEffect để poll payment status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (showPayment && paymentInfo.orderCode) {
      intervalId = setInterval(async () => {
        try {
          const response = await axiosInstance.get(`/rentals/check-payment/${paymentInfo.orderCode}`);
          console.log('Payment status:', response.data);
          
          // Kiểm tra URL hiện tại có phải là callback từ PayOS không
          const currentUrl = new URL(window.location.href);
          if (currentUrl.pathname.includes('/success')) {
            // Gọi API để cập nhật trạng thái thanh toán
            await axiosInstance.post(`/rentals/update-payment/${paymentInfo.orderCode}`, {
              status: 'PAID'
            });
            
            // Redirect về trang success của ứng dụng
            window.location.href = `${import.meta.env.VITE_APP_URL}/rental-success?orderCode=${paymentInfo.orderCode}&amount=${calculateTotal()}`;
            return;
          }

          // Polling bình thường
          if (response.data.status === 'PAID') {
            clearInterval(intervalId);
            setShowPayment(false);
            window.location.href = `${import.meta.env.VITE_APP_URL}/rental-success?orderCode=${paymentInfo.orderCode}&amount=${calculateTotal()}`;
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [showPayment, paymentInfo.orderCode, calculateTotal]);

  const fetchBookedDates = async () => {
    try {
      console.log('Fetching booked dates for:', id);
      const response = await axiosInstance.get(`/rentals/booked-dates/${id}`);
      if (response.data) {
        console.log('Booked dates:', response.data);
        setBookedDates(response.data);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      // Thêm xử lý lỗi UI nếu cần
      setError('Không thể tải thông tin ngày đã đặt');
    }
  };

  // Thêm useEffect để gọi lại API khi có thay đổi về đặt hàng
  useEffect(() => {
    if (id) {
      fetchBookedDates();
    }
    // Polling mỗi 30s để cập nhật ngày đã đặt
    const intervalId = setInterval(() => {
      if (id) {
        fetchBookedDates();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [id]);

  // Kiểm tra ngày có được đặt không
  const isDateBooked = useCallback((date: Date) => {
    if (!date || !bookedDates.length) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some(booking => {
      const start = new Date(booking.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(booking.end);
      end.setHours(0, 0, 0, 0);

      return checkDate >= start && checkDate <= end;
    });
  }, [bookedDates]);

  // Tách riêng hàm xử lý thay đổi ngày
  const handleDateChange = useCallback((field: 'rentDate' | 'returnDate') => (newValue: Date | null) => {
    if (!newValue) return;

    const date = new Date(newValue);
    date.setHours(0, 0, 0, 0);

    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography>Đang tải...</Typography>
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'identityCard' | 'studentCard') => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!formData.customerName.trim()) {
      alert('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.identityCard) {
      alert('Vui lòng tải lên CCCD/CMND');
      return;
    }
    if (!formData.rentDate || !formData.returnDate) {
      alert('Vui lòng chọn ngày thuê và ngày trả');
      return;
    }

    try {
      console.log('=== SUBMITTING RENTAL ===');
      
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('paymentMethod', paymentMethod);
      if (formData.identityCard) {
        formDataToSend.append('identityCard', formData.identityCard);
      }
      formDataToSend.append('rentDate', formData.rentDate?.toISOString() || '');
      formDataToSend.append('returnDate', formData.returnDate?.toISOString() || '');
      formDataToSend.append('totalAmount', calculateTotal().toString());
      formDataToSend.append('clothesId', product?.id || '');

      const response = await axiosInstance.post('/rentals', formDataToSend);
      console.log('=== RENTAL RESPONSE ===');
      console.log('Response:', response.data);

      setOpenRentalForm(false);

      if (paymentMethod === 'transfer' && response.data.paymentUrl) {
        localStorage.setItem(`rental_amount_${response.data.orderCode}`, calculateTotal().toString());
        window.location.href = response.data.paymentUrl;
      } else if (paymentMethod === 'cash') {
        navigate(`/rental-success?orderCode=${response.data.orderCode}&amount=${calculateTotal()}&status=pending`);
      }
    } catch (error) {
      console.error('=== RENTAL ERROR ===');
      console.error('Error:', error);
      const apiError = error as ApiError;
      if (apiError.response) {
        console.error('Response:', apiError.response.data);
      }
      alert(apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuê');
    }
  };

  const handleUploadClick = () => {
    setOpenPrivacyDialog(true);
  };

  const handlePrivacyAccept = () => {
    setOpenPrivacyDialog(false);
    const fileInput = document.getElementById('cccd-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value;
    if (!/^\d*$/.test(phoneNumber)) return;
    if (phoneNumber.length > 11) return;
    
    setFormData(prev => ({
      ...prev,
      phone: phoneNumber
    }));
  };

  const isPhoneValid = formData.phone.startsWith('0') && formData.phone.length >= 10;

  return (
    <Container maxWidth="xl" sx={{ bgcolor: theme.colors.background, minHeight: '100vh', py: 4, position: 'relative' }}>
      <SnowfallEffect />

      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Phần hình ảnh */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '300px', md: '600px' },
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                mb: 2
              }}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </Box>

            {/* Thumbnails */}
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              mt: 2 
            }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === index ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Phần thông tin */}
          <Grid item xs={12} md={5}>
            <Typography variant="h4" sx={{ mb: 2, color: theme.colors.text }}>
              {product.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                SKU: {product.sku}
              </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ color: theme.colors.sale, fontWeight: 'bold' }}>
                {formatPrice(product.price)}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.colors.original,
                  textDecoration: 'line-through'
                }}
              >
                {formatPrice(product.originalPrice)}
              </Typography>
              <Chip 
                label="-50%" 
                sx={{ 
                  bgcolor: theme.colors.sale,
                  color: 'white'
                }}
              />
            </Box>

            {/* Chọn size */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1 }}>Kích thước:</Typography>
              <RadioGroup
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.sizes.map((size: string) => (
                  <FormControlLabel 
                    key={size}
                    value={size}
                    control={<Radio />}
                    label={size}
                  />
                ))}
              </RadioGroup>
            </Box>

            {/* Thay thế 2 nút bằng 1 nút Thuê Ngay */}
            {product.status === 'available' ? (
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: theme.colors.sale,
                  '&:hover': {
                    bgcolor: '#FF0080'
                  },
                  py: 1.5,
                  mb: 4,
                  fontSize: '1.1rem'
                }}
                onClick={handleRentClick}
              >
                Thuê Ngay
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                disabled
                sx={{
                  py: 1.5,
                  mb: 4,
                  fontSize: '1.1rem',
                  bgcolor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                Đã Được Thuê
              </Button>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Thông tin thêm */}
            <Box>
              {/* Thông tin sản phẩm */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Thông tin sản phẩm</Typography>
                <Typography>{product.description}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Phần chính sách và liên hệ */}
        <Grid container spacing={4}>
          {/* Chính sách đổi trả */}
          <Grid item xs={12} md={6} sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Chính sách đổi trả hàng</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li">Không hỗ trợ kiểm tra hàng</Typography>
              <Typography component="li">Đổi trả trong vòng 3 ngày kể từ khi nhận hàng</Typography>
              <Typography component="li">
                Nếu sản phẩm lỗi hoặc ship sai - Vui lòng gửi hàng đổi trả tại địa chỉ{' '}
                <Typography component="span" sx={{ fontWeight: 'bold' }}>
                  158 HUỲNH VĂN BÁNH F.12 Q.PHÚ NHUẬN
                </Typography>
              </Typography>
            </Box>
          </Grid>

          {/* Liên hệ */}
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Liên hệ chúng tôi</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography>
                Hotline:{' '}
                <Typography component="span" sx={{ fontWeight: 'bold' }}>
                  084.266.1150
                </Typography>
              </Typography>
              <Typography>Từ 9h30 sáng tới 21h30 tối các ngày trong tuần</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openPrivacyDialog} onClose={() => setOpenPrivacyDialog(false)}>
        <DialogTitle>Chính sách bảo mật thông tin</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Chúng tôi cam kết:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">
              Thông tin CCCD của bạn sẽ được mã hóa và bảo mật
            </Typography>
            <Typography component="li">
              Chỉ sử dụng cho mục đích xác minh danh tính
            </Typography>
            <Typography component="li">
              Không chia sẻ với bất kỳ bên thứ ba nào
            </Typography>
            <Typography component="li">
              Tự động xóa sau khi kết thúc hợp đồng thuê 🥰
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrivacyDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handlePrivacyAccept}>
            Đồng ý và Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRentalForm}>
        <DialogTitle>Thông tin thuê đồ</DialogTitle>
        <DialogContent>
          {/* Thông tin cá nhân */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={formData.customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData(prev => ({
                  ...prev,
                  customerName: e.target.value
                }));
              }}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }));
              }}
            />
            <Button
              component="label"
              variant="outlined"
              fullWidth
            >
              Upload CCCD/CMND
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'identityCard')}
              />
            </Button>
            {formData.identityCard && (
              <Typography variant="caption" color="success.main">
                Đã tải lên: {formData.identityCard.name}
              </Typography>
            )}

            {/* Phương thức thanh toán */}
            <FormControl fullWidth>
              <InputLabel>Phương thức thanh toán</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer')}
              >
                <MenuItem value="transfer">Chuyển khoản</MenuItem>
                <MenuItem value="cash">Tiền mặt</MenuItem>
              </Select>
            </FormControl>

            {/* Chọn ngày và giờ */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Ngày thuê"
                value={formData.rentDate}
                onChange={handleDateChange('rentDate')}
                shouldDisableDate={isDateBooked}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true
                  } as TextFieldProps
                }}
              />
              <DatePicker
                label="Ngày trả"
                value={formData.returnDate}
                onChange={handleDateChange('returnDate')}
                shouldDisableDate={isDateBooked}
                minDate={formData.rentDate || undefined}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true
                  } as TextFieldProps
                }}
              />
              <TimePicker
                label="Giờ lấy hàng"
                value={pickupTime}
                onChange={(newValue) => {
                  if (newValue) {
                    setPickupTime(newValue);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  } as TextFieldProps
                }}
              />
            </LocalizationProvider>

            {/* Hiển thị tổng tiền */}
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'rgba(255,20,147,0.04)', 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tổng tiền:
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {new Intl.NumberFormat('vi-VN').format(calculateTotal())}₫
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenRentalForm(false)}
            variant="outlined"
            sx={{
              color: '#FF1493',
              borderColor: '#FF1493',
              '&:hover': {
                borderColor: '#FF69B4',
                backgroundColor: 'rgba(255,20,147,0.04)'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#FF1493',
              '&:hover': {
                bgcolor: '#FF69B4'
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail; 