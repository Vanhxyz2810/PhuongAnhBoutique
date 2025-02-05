import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode');

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      gap={3}
    >
      <CancelIcon sx={{ fontSize: 60, color: 'error.main' }} />
      <Typography variant="h5" color="error.main">
        Đã hủy thanh toán
      </Typography>
      <Typography>
        Mã đơn hàng: {orderCode}
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{
          bgcolor: '#FF1493',
          '&:hover': {
            bgcolor: '#FF69B4'
          }
        }}
      >
        Quay về trang chủ
      </Button>
    </Box>
  );
};

export default PaymentCancel; 