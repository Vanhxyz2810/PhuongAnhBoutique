import { useSearchParams, Link } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const RentalSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const amount = searchParams.get('amount');

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Thanh toán thành công!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Mã đơn hàng: {orderCode}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Số tiền: {amount ? new Intl.NumberFormat('vi-VN').format(Number(amount)) : 0}đ
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
            sx={{ mr: 2 }}
          >
            Về trang chủ
          </Button>
          <Button 
            component={Link} 
            to="/my-orders" 
            variant="outlined"
          >
            Xem đơn hàng
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RentalSuccess; 