import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../utils/axios';
import OrderStatus from '../components/OrderStatus';

interface Rental {
  id: number;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  rentDate: string;
  returnDate: string;
  status: string;
  clothes: {
    id: string;
    name: string;
    images: string[];
  };
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/rentals/my-rentals');
        setOrders(response.data);
      } catch (error) {
        setError('Không thể tải danh sách đơn hàng');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Đơn Thuê Của Tôi
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card sx={{ display: 'flex', p: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 140, height: 140, objectFit: 'cover' }}
                image={`http://localhost:5001${order.clothes.images[0]}`}
                alt={order.clothes.name}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
                <CardContent sx={{ flex: '1 0 auto', p: 0 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom>
                      {order.clothes.name}
                    </Typography>
                    <OrderStatus status={order.status} />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mã đơn: {order.orderCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Người thuê: {order.customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày thuê: {format(new Date(order.rentDate), 'dd/MM/yyyy', { locale: vi })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ngày trả: {format(new Date(order.returnDate), 'dd/MM/yyyy', { locale: vi })}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="h6" color="primary" align="right">
                    {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}

        {orders.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Bạn chưa có đơn thuê nào</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MyOrders; 