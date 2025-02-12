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
  Divider,
  Button,
  Rating,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../utils/axios';
import { ShoppingBagOutlined } from '@mui/icons-material';
import OrderStatus from '../components/OrderStatus';
import { theme } from '../theme';
import { useSnackbar } from 'notistack';
import FeedbackModal from '../components/FeedbackModal';
import SearchIcon from '@mui/icons-material/Search';

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
    image: string;
  };
  hasFeedback: boolean;
}

const MyOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackOrder, setFeedbackOrder] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(0);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const handleSubmitFeedback = async (data: {
    rating: number;
    message: string;
    images: File[];
  }) => {
    try {
      const uploadedImages = await Promise.all(
        data.images.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axiosInstance.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response.data.url;
        })
      );

      await axiosInstance.post('/rentals/feedback', {
        orderId: selectedOrderId,
        rating: data.rating,
        message: data.message,
        images: uploadedImages
      });

      const response = await axiosInstance.get('/rentals/my-rentals');
      setOrders(response.data);
      
      enqueueSnackbar('Cảm ơn bạn đã gửi feedback! Bạn sẽ được giảm 10k cho lần thuê sau 🎉', {
        variant: 'success'
      });
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      enqueueSnackbar('Có lỗi xảy ra khi gửi feedback', { variant: 'error' });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderCode.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.clothes.name.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'left' }}>
        Đơn Thuê Của Tôi
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo mã đơn, tên người thuê, tên sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">Tất cả trạng thái</MenuItem>
            <MenuItem value="pending">Chờ xác nhận</MenuItem>
            <MenuItem value="pending_payment">Chờ thanh toán</MenuItem>
            <MenuItem value="approved">Đã xác nhận</MenuItem>
            <MenuItem value="completed">Hoàn thành</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
            <MenuItem value="rejected">Từ chối</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card sx={{ display: 'flex', p: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 140, height: 140, objectFit: 'cover' }}
                  image={order.clothes?.image || '/placeholder.jpg'}
                  alt={order.clothes?.name || 'Product'}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" gutterBottom>
                        {order.clothes?.name || 'Product'}
                      </Typography>
                      <OrderStatus status={order.status} />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <b>Mã đơn:</b> {order.orderCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <b>Người thuê:</b> {order.customerName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <b>Ngày thuê:</b> {format(new Date(order.rentDate), 'dd/MM/yyyy', { locale: vi })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <b>Ngày trả:</b> {format(new Date(order.returnDate), 'dd/MM/yyyy', { locale: vi })}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="h6" color="primary" align="right">
                      {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                    </Typography>

                    {order.status === 'completed' && !order.hasFeedback && (
                      <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          Bạn iu ơi gửi feedback sẽ được giảm 10k cho lần thuê sau 🥰
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setFeedbackModalOpen(true);
                          }}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark
                            }
                          }}
                        >
                          Gửi feedback
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <ShoppingBagOutlined sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  Không tìm thấy đơn hàng nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thử tìm kiếm với từ khóa khác
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedOrderId(null);
        }}
        onSubmit={handleSubmitFeedback}
      />
    </Container>
  );
};

export default MyOrders; 