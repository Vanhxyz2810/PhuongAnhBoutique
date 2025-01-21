import { useSearchParams, Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import Snowfall from 'react-snowfall';

// Định nghĩa theme màu sắc
const theme = {
  colors: {
    primary: '#FF90BC',
    secondary: '#FFC0D9',
    background: '#FFF5F7',
    text: '#4A4A4A'
  }
};

const RentalSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.colors.background,
      position: 'relative',
      pt: 8,
      pb: 6
    }}>
      <Snowfall 
        snowflakeCount={50}
        radius={[1, 4]}
        speed={[0.5, 2]}
        wind={[-0.5, 2]}
      />
      
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <CheckCircle 
              sx={{ 
                fontSize: 80,
                color: 'success.main',
                mb: 3,
                animation: 'bounce 1s infinite'
              }} 
            />
            
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: theme.colors.text,
                mb: 3
              }}
            >
              Thanh toán thành công!
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                color: theme.colors.text,
                fontSize: '1.1rem'
              }}
            >
              Mã đơn hàng: <strong>{orderCode}</strong>
            </Typography>

            <Typography 
              variant="body1"
              sx={{ 
                mb: 4,
                color: theme.colors.text,
                fontSize: '1.1rem',
                fontStyle: 'italic'
              }}
            >
              Cảm ơn bạn đã ủng hộ dịch vụ của chúng tôi!
            </Typography>

            <Box sx={{ 
              mt: 2,
              display: 'flex',
              gap: 2
            }}>
              <Button
                component={Link}
                to="/"
                variant="contained"
                sx={{
                  bgcolor: theme.colors.primary,
                  '&:hover': {
                    bgcolor: theme.colors.secondary
                  },
                  px: 3,
                  py: 1
                }}
              >
                Về trang chủ
              </Button>
              
              <Button
                component={Link}
                to="/my-orders"
                variant="outlined"
                sx={{
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                  '&:hover': {
                    borderColor: theme.colors.secondary,
                    bgcolor: 'rgba(255, 144, 188, 0.1)'
                  },
                  px: 3,
                  py: 1
                }}
              >
                Xem đơn hàng
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RentalSuccess; 