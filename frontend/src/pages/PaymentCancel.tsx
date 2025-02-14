import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import axiosInstance from '../utils/axios';
import { enqueueSnackbar } from 'notistack';
import { AxiosError } from 'axios';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    // Cập nhật trạng thái quần áo khi hủy thanh toán
    const updateClothesStatus = async () => {
      try {
        console.log('Attempting to cancel rental with orderCode:', orderCode);
        const response = await axiosInstance.put(`/rentals/cancel/${orderCode}`);
        console.log('Cancel response:', response.data);
        enqueueSnackbar('Đã hủy thanh toán', { variant: 'info' });
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Error details:', error.response?.data);
        }
        console.error('Error updating clothes status:', error);
      }
    };

    if (orderCode) {
      updateClothesStatus();
    }
  }, [orderCode]);

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