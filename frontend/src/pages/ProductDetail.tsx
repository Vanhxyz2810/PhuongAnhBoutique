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
  images: string[];
  sizes: string[];
  description: string;
  sku: string;
  image: string;
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

// interface RentalFormData {
//   customerName: string;
//   phone: string;
//   identityCard: File | null;
//   studentCard: File | null;
//   rentDate: Date | null;
//   returnDate: Date | null;
//   paymentQR?: string;
//   orderCode?: string;
// }

// Lazy load RentalForm
const RentalForm = lazy(() => import('../components/RentalForm'));

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
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    identityCard: null as File | null,
    rentDate: null as Date | null,
    returnDate: null as Date | null,
  });
  const [paymentInfo, setPaymentInfo] = useState<{
    orderCode?: string;
    qrCodeUrl?: string;
  }>({});

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
      setProduct(response.data);
    } catch (error: unknown) {
      console.error('=== RENTAL ERROR ===');
      console.error('Error:', error);
      const apiError = error as ApiError;
      if (apiError.response) {
        console.error('Response:', apiError.response.data);
      }
      alert(apiError.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuê');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  // Thêm useEffect để poll payment status
  useEffect(() => {
    let intervalId: number;
    
    if (showPayment && paymentInfo.orderCode) {
      // Poll mỗi 5 giây
      intervalId = setInterval(async () => {
        try {
          const response = await axiosInstance.get(`/rentals/payment-status/${paymentInfo.orderCode}`);
          console.log('Payment status:', response.data.status);
          
          if (response.data.status === 'approved') {
            // Redirect to success page
            navigate('/success-payment');
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
  }, [showPayment, paymentInfo.orderCode, navigate]);

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

  const calculateTotal = () => {
    if (!formData.rentDate || !formData.returnDate || !product) {
      return 0;
    }
    const days = Math.ceil((formData.returnDate.getTime() - formData.rentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * product.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thuê sản phẩm');
      navigate('/login');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('phone', formData.phone);
      if (formData.identityCard) {
        formDataToSend.append('identityCard', formData.identityCard);
      }
      formDataToSend.append('rentDate', formData.rentDate?.toISOString() || '');
      formDataToSend.append('returnDate', formData.returnDate?.toISOString() || '');
      formDataToSend.append('totalAmount', calculateTotal().toString());
      formDataToSend.append('clothesId', product?.id || '');

      console.log('=== SUBMITTING RENTAL ===');
      console.log('Form data:', Object.fromEntries(formDataToSend));

      const response = await axiosInstance.post('/rentals', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('=== RENTAL RESPONSE ===');
      console.log('Response:', response.data);
      
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else if (response.data.paymentQR) {
        setPaymentInfo({
          orderCode: response.data.orderCode,
          qrCodeUrl: response.data.paymentQR
        });
        setShowPayment(true);
      } else {
        console.error('=== MISSING PAYMENT INFO ===');
        console.error('Response data:', response.data);
        alert('Không thể tạo thông tin thanh toán');
      }

    } catch (error: unknown) {
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
                src={`${import.meta.env.VITE_MEDIA_URL}/uploads/clothes/${product.image}`}
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
                    src={`${import.meta.env.VITE_MEDIA_URL}/uploads/clothes/${image}`}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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

      <Suspense fallback={<div>Loading...</div>}>
        {openRentalForm && (
          <RentalForm 
            open={openRentalForm}
            onClose={() => setOpenRentalForm(false)}
            product={product}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
            onPhoneChange={handlePhoneChange}
            isPhoneValid={isPhoneValid}
            onUploadClick={handleUploadClick}
            onPrivacyAccept={handlePrivacyAccept}
            showPayment={showPayment}
            paymentInfo={paymentInfo}
            calculateTotal={calculateTotal}
          />
        )}
      </Suspense>

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
    </Container>
  );
};

export default ProductDetail; 