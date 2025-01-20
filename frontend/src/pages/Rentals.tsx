import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Box,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../utils/axios';
import OrderStatus from '../components/OrderStatus';
import MoneyIcon from '@mui/icons-material/MonetizationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Rental {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  rentDate: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  identityCard: string;
  clothes: {
    id: string;
    name: string;
    images: string[];
  };
}

const statusOptions = [
  { value: 'pending', label: 'Đang duyệt', color: 'warning' },
  { value: 'approved', label: 'Xác nhận', color: 'info' },
  { value: 'completed', label: 'Hoàn thành', color: 'success' },
  { value: 'rejected', label: 'Từ chối', color: 'error' }
];

const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/rentals');
      setRentals(response.data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      await axiosInstance.put(`/rentals/${rentalId}/status`, {
        status: newStatus
      });
      
      // Refresh danh sách sau khi cập nhật
      fetchRentals();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Thêm hàm tính toán thống kê
  const calculateStats = () => {
    const completedRentals = rentals.filter(r => r.status === 'completed');
    const totalRevenue = completedRentals.reduce((sum, rental) => sum + rental.totalAmount, 0);
    const totalRentals = rentals.length;
    const completedCount = completedRentals.length;

    return {
      totalRevenue,
      totalRentals,
      completedCount
    };
  };

  const stats = calculateStats();

  // Hàm mở/đóng modal xem ảnh
  const handleOpenImage = (imageUrl: string) => setSelectedImage(imageUrl);
  const handleCloseImage = () => setSelectedImage(null);

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Đang tải...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          color: 'primary.main',
          fontWeight: 'medium'
        }}
      >
        Quản Lý Đơn Thuê
      </Typography>

      {/* Thống kê */}
      <Paper 
        elevation={3}
        sx={{ 
          p: { xs: 2, sm: 3 }, // Responsive padding
          mb: 4,
          background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4E8 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(to left, rgba(255,255,255,0.3), transparent)',
            transform: 'skewX(-15deg)',
          },
          '& .MuiTypography-root': {
            color: '#FF4D6D'
          },
          '& .MuiSvgIcon-root': {
            color: '#FF4D6D'
          }
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" sx={{ 
                mb: 2,
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Tổng Doanh Thu (Đã Thanh Toán)
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 2, sm: 3 },
                background: 'rgba(255,255,255,0.5)',
                p: { xs: 2, sm: 3 },
                borderRadius: 2
              }}>
                <Box sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  borderRadius: '50%', 
                  background: '#FF4D6D20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MoneyIcon sx={{ fontSize: { xs: 35, sm: 45 } }} />
                </Box>

                <Box>
                  <Typography sx={{ 
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.8rem', sm: '2.5rem' }
                  }}>
                    {new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ
                  </Typography>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    background: '#FF4D6D10',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 1.5
                  }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: '1rem' }} />
                    <Typography sx={{ 
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      fontWeight: 500
                    }}>
                      Hoàn thành: <strong>{stats.completedCount}</strong> / {stats.totalRentals}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {rentals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Chưa có đơn hàng nào</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Ngày thuê</TableCell>
                <TableCell>Ngày trả</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>CCCD</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{rental.orderCode}</TableCell>
                  <TableCell>{rental.customerName}</TableCell>
                  <TableCell>{rental.phone}</TableCell>
                  <TableCell>{rental.clothes.name}</TableCell>
                  <TableCell>
                    {format(new Date(rental.rentDate), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(rental.returnDate), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(rental.totalAmount)}đ
                  </TableCell>
                  <TableCell>
                    {rental.identityCard && (
                      <Tooltip title="Xem CCCD">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenImage(`https://phuonganhboutique-production.up.railway.app${rental.identityCard}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderStatus status={rental.status} />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={rental.status}
                        onChange={(e) => handleStatusChange(rental.id, e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            color: statusOptions.find(opt => opt.value === rental.status)?.color
                          }
                        }}
                      >
                        {statusOptions.map(option => (
                          <MenuItem 
                            key={option.value} 
                            value={option.value}
                            sx={{ color: `${option.color}.main` }}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal xem ảnh */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseImage}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="CCCD"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Rentals; 