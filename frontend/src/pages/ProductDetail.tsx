import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Snowfall from 'react-snowfall';
import axios from 'axios';

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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  const fetchProduct = async () => {
    try {
      if (!id) {
        setError('ID sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      console.log('Fetching product with ID:', id); // Debug log
      const response = await axios.get(`http://localhost:5001/api/clothes/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) { // Chỉ gọi API khi có ID
      fetchProduct();
    }
  }, [id]);

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
            <Box sx={{ mb: 2 }}>
              <img 
                src={`http://localhost:5001${product.images[selectedImage]}`}
                alt={product.name}
                style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }}
              />
            </Box>
            <Grid container spacing={1}>
              {product.images.map((img: string, index: number) => (
                <Grid item xs={3} key={index}>
                  <Box 
                    onClick={() => setSelectedImage(index)}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.colors.primary}` : '2px solid transparent'
                    }}
                  >
                    <img 
                      src={`http://localhost:5001${img}`}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
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
    </Container>
  );
};

export default ProductDetail; 