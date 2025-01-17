import { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';
import { 
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Container,
  Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Định nghĩa lại bảng màu với các tone hồng khác nhau
const theme = {
  colors: {
    primary: '#FF90BC',      // Hồng nhạt (chủ đạo)
    secondary: '#FFC0D9',    // Hồng nhạt hơn
    success: '#FF4D94',      // Hồng đậm cho "Có sẵn"
    warning: '#FFB6C1',      // Hồng nhạt cho "Đang thuê"
    background: '#FFF5F7',   // Hồng rất nhạt (background)
    text: '#4A4A4A',         // Xám đậm (text)
    buttonAvailable: '#FF1493', // Hồng đậm cho nút "Thuê Ngay"
    buttonRented: '#E0B0B0',    // Hồng xám cho nút "Đã Cho Thuê"
    buttonHoverAvailable: '#FF0080', // Hồng đậm hơn khi hover
    buttonHoverRented: '#D3A4A4'     // Hồng xám đậm hơn khi hover
  }
};

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  status: 'available' | 'rented';
  image: string;
  description?: string;
}

// Thêm các images cho hiệu ứng
const images = [
  '/images/hoaDao.png',  // Cần thêm ảnh hoa đào vào thư mục public/images
  '/images/lixi.png',    // Cần thêm ảnh bao lì xì vào thư mục public/images
];

// Tạo các Image object
const imagesLoaded = images.map(image => {
  const img = new Image();
  img.src = image;
  return img;
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState<Clothes[]>([]);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/clothes');
        setClothes(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };

    fetchClothes();
  }, []);

  // Thêm hàm xử lý click
  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ bgcolor: theme.colors.background, minHeight: '100vh', py: 4, position: 'relative' }}>
      <Snowfall 
        images={imagesLoaded}
        radius={[20, 30]} // Điều chỉnh kích thước lớn hơn cho hoa đào và lì xì
        snowflakeCount={30} // Giảm số lượng để không quá rối
        speed={[1, 3]} // Tốc độ rơi
        wind={[-0.5, 2]} // Hiệu ứng gió
        rotationSpeed={[-1, 1]} // Tốc độ xoay
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          opacity: 0.7 // Làm mờ đi một chút
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            color: theme.colors.primary,
            textAlign: 'center'
          }}
        >
          Bộ Sưu Tập Quần Áo
        </Typography>
        
        <Grid container spacing={3}>
          {clothes.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id} 
              onClick={() => handleProductClick(item.id)}
              sx={{ cursor: 'pointer' }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '120%' }}>
                  <CardMedia
                    component="img"
                    image={`http://localhost:5001${item.image}`}
                    alt={item.name}
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                
                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    p: 2,
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: theme.colors.text,
                      height: '48px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {item.name}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        color: theme.colors.primary
                      }}
                    >
                      {item.rentalPrice.toLocaleString()}đ
                    </Typography>
                    <Chip
                      label={item.status === 'available' ? 'Có sẵn' : 'Đang thuê'}
                      sx={{
                        bgcolor: item.status === 'available' 
                          ? theme.colors.success 
                          : theme.colors.warning,
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                      size="small"
                    />
                  </Box>
                  
                  <Button 
                    fullWidth 
                    variant="contained"
                    disabled={item.status !== 'available'}
                    sx={{
                      mt: 'auto',
                      bgcolor: item.status === 'available' 
                        ? theme.colors.buttonAvailable 
                        : theme.colors.buttonRented,
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: item.status === 'available' 
                          ? theme.colors.buttonHoverAvailable 
                          : theme.colors.buttonHoverRented,
                      },
                      '&.Mui-disabled': {
                        bgcolor: theme.colors.buttonRented,
                        color: 'white',
                        opacity: 1 // Giữ độ đậm của màu khi disabled
                      },
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1
                    }}
                  >
                    {item.status === 'available' ? 'Thuê Ngay' : 'Đã Cho Thuê'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {clothes.length === 0 && (
          <Box 
            sx={{ 
              py: 8, 
              textAlign: 'center',
              color: theme.colors.text
            }}
          >
            <Typography>Chưa có sản phẩm nào</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 