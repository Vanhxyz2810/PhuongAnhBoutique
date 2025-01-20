import { useState, useEffect, useCallback } from 'react';
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

  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Snowfall from 'react-snowfall';
// import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import vi from 'date-fns/locale/vi';
import { CloudUpload } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { AxiosError } from 'axios';

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
}

interface RentalFormData {
  customerName: string;
  phone: string;
  identityCard: File | null;
  studentCard: File | null;
  rentDate: Date | null;
  returnDate: Date | null;
  paymentQR?: string;
  orderCode?: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [openRentalForm, setOpenRentalForm] = useState(false);
  const [formData, setFormData] = useState<RentalFormData>({
    customerName: '',
    phone: '',
    identityCard: null,
    studentCard: null,
    rentDate: null,
    returnDate: null
  });
  const [openPrivacyDialog, setOpenPrivacyDialog] = useState(false);
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<{
    qrCode?: string;
    orderCode?: string;
    expireTime?: number;
  }>({});
  const [showPayment, setShowPayment] = useState(false);

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
      console.error('Lỗi khi lấy dữ liệu:', error);
      if (error instanceof AxiosError) {
        if (error.code === 'ERR_NETWORK') {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối.');
        } else {
          setError(error.response?.data?.message || 'Không thể tải thông tin sản phẩm');
        }
      } else {
        setError('Không thể tải thông tin sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

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
      const rentalFormData = new FormData();
      rentalFormData.append('customerName', formData.customerName);
      rentalFormData.append('phone', formData.phone);
      if (formData.identityCard) {
        rentalFormData.append('identityCard', formData.identityCard);
      }
      if (formData.rentDate) {
        rentalFormData.append('rentDate', formData.rentDate.toISOString());
      }
      if (formData.returnDate) {
        rentalFormData.append('returnDate', formData.returnDate.toISOString());
      }
      rentalFormData.append('totalAmount', calculateTotal().toString());
      if (product?.id) {
        rentalFormData.append('clothesId', product.id);
      }

      console.log('Submitting rental form data:', {
        customerName: formData.customerName,
        phone: formData.phone,
        rentDate: formData.rentDate?.toISOString(),
        returnDate: formData.returnDate?.toISOString(),
        totalAmount: calculateTotal(),
        clothesId: product?.id
      });

      const response = await axiosInstance.post('/rentals', rentalFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setPaymentInfo({
          qrCode: response.data.paymentQR,
          orderCode: response.data.orderCode,
          expireTime: response.data.expireAt
        });
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Full error details:', {
        error,
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      });
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuê');
      } else {
        alert('Có lỗi xảy ra khi tạo đơn thuê');
      }
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
                src={`http://localhost:5001${product.images[selectedImage]}`}
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
                    src={`http://localhost:5001${image}`}
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
              onClick={() => setOpenRentalForm(true)}
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

      <Dialog 
        open={openRentalForm} 
        onClose={() => setOpenRentalForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.colors.text }}>Thông Tin Thuê Quần Áo</DialogTitle>
        <DialogContent>
          {!showPayment ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Họ và tên"
                  fullWidth
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerName: e.target.value
                  }))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Số điện thoại"
                  fullWidth
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  error={formData.phone.length > 0 && !isPhoneValid}
                  helperText={
                    formData.phone.length > 0 && !isPhoneValid
                      ? 'Số điện thoại phải bắt đầu bằng số 0 và có ít nhất 10 số'
                      : ''
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUpload />}
                  onClick={handleUploadClick}
                >
                  Upload CCCD
                </Button>
                <input
                  id="cccd-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'identityCard')}
                />
                {formData.identityCard && (
                  <Chip
                    label={formData.identityCard.name}
                    onDelete={() => setFormData(prev => ({ ...prev, identityCard: null }))}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày thuê"
                    value={formData.rentDate}
                    onChange={(date) => setFormData(prev => ({
                      ...prev,
                      rentDate: date
                    }))}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                  <DatePicker
                    label="Ngày trả"
                    value={formData.returnDate}
                    onChange={(date) => setFormData(prev => ({
                      ...prev,
                      returnDate: date
                    }))}
                    minDate={formData.rentDate || new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="h6" align="right">
                    Tổng tiền: {calculateTotal().toLocaleString()}đ
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} textAlign="center">
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    maxWidth: 500, 
                    mx: 'auto',
                    background: 'linear-gradient(to bottom, #fff1f6, #fff)',
                    border: '1px solid #ffe4e4',
                    borderRadius: 3
                  }}
                >
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      color: theme.colors.primary,
                      fontWeight: 'bold',
                      mb: 3
                    }}
                  >
                    Quét mã QR để thanh toán
                  </Typography>

                  {paymentInfo.qrCode && (
                    <Box 
                      sx={{ 
                        my: 3,
                        p: 3,
                        bgcolor: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        display: 'inline-block'
                      }}
                    >
                      <img 
                        src={paymentInfo.qrCode} 
                        alt="Payment QR" 
                        style={{ 
                          width: 250,
                          height: 250,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}

                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" sx={{ color: theme.colors.text }}>
                      Số tiền: {calculateTotal().toLocaleString()}đ
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: theme.colors.text }}>
                      Mã đơn hàng: <b>{paymentInfo.orderCode}</b>
                    </Typography>
                  </Box>

                  {paymentInfo.expireTime && (
                    <Typography 
                      color="error" 
                      sx={{ 
                        mt: 2,
                        p: 1,
                        bgcolor: '#fff3f3',
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      QR code sẽ hết hạn sau {Math.floor((paymentInfo.expireTime - Date.now()) / 1000 / 60)} phút
                    </Typography>
                  )}

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => {
                        alert('Cảm ơn bạn đã đặt thuê! Chúng tôi sẽ xử lý đơn hàng sau khi nhận được thanh toán.');
                        setOpenRentalForm(false);
                        setShowPayment(false);
                        navigate('/my-orders');
                      }}
                      sx={{ 
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Tôi đã thanh toán
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenRentalForm(false);
            setShowPayment(false);
          }}>
            Đóng
          </Button>
          {!showPayment && (
            <Button 
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.customerName ||
                !formData.phone ||
                !formData.identityCard ||
                !formData.rentDate ||
                !formData.returnDate ||
                !isPhoneValid
              }
            >
              Xác Nhận Thuê
            </Button>
          )}
        </DialogActions>
      </Dialog>

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