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
  Tooltip,
  TextField,
  InputAdornment,
  Stack,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '../utils/axios';
import OrderStatus from '../components/OrderStatus';
import MoneyIcon from '@mui/icons-material/MonetizationOn';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Delete } from '@mui/icons-material';
import { theme } from '../theme';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { enqueueSnackbar } from 'notistack';
import CCCDInfoDialog from '../components/CCCDInfoDialog';
import { CCCDInfo } from '../types/cccd';

interface Rental {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  rentDate: string;
  returnDate: string;
  status: 'pending' | 'pending_payment' | 'approved' | 'completed' | 'rejected' | 'cancelled';
  identityCard: string;
  clothes: {
    id: string;
    name: string;
    images: string[];
  };
  cccdInfo?: CCCDInfo | string;
}

const statusOptions = [
  { value: 'pending', label: 'Đang duyệt', color: 'warning' },
  { value: 'pending_payment', label: 'Chờ thanh toán', color: 'info' },
  { value: 'approved', label: 'Xác nhận', color: 'info' },
  { value: 'completed', label: 'Hoàn thành', color: 'success' },
  { value: 'rejected', label: 'Từ chối', color: 'error' },
  { value: 'cancelled', label: 'Đã hủy', color: 'error' }
];

const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<number | null>(null);
  const [cccdDialogOpen, setCccdDialogOpen] = useState(false);
  const [selectedCCCD, setSelectedCCCD] = useState<{
    image: string;
    info?: CCCDInfo;
  }>();

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/rentals');
      console.log('Raw API Response:', response.data);
      
      // Kiểm tra cấu trúc dữ liệu của một rental
      if (response.data.length > 0) {
        console.log('Sample rental:', response.data[0]);
        console.log('Sample rental cccdInfo:', response.data[0].cccdInfo);
      }

      const transformedRentals = response.data.map((rental: Rental) => {
        console.log('Processing rental:', rental.orderCode);
        console.log('Original cccdInfo:', rental.cccdInfo);
        
        let parsedInfo;
        try {
          parsedInfo = rental.cccdInfo ? (
            typeof rental.cccdInfo === 'string' ? JSON.parse(rental.cccdInfo) : rental.cccdInfo
          ) : undefined;
          console.log('Parsed cccdInfo:', parsedInfo);
        } catch (error) {
          console.error('Error parsing cccdInfo for rental:', rental.orderCode, error);
        }

        return {
          ...rental,
          cccdInfo: parsedInfo
        };
      });

      console.log('Final transformed rentals:', transformedRentals);
      setRentals(transformedRentals);
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

  useEffect(() => {
    console.log('Current rentals:', rentals);
  }, [rentals]);

  const handleStatusChange = async (rentalId: number, newStatus: string) => {
    try {
      setLoadingStatus(rentalId);
      await axiosInstance.put(`/rentals/${rentalId}/status`, {
        status: newStatus
      });
      await fetchRentals();
      enqueueSnackbar('Cập nhật trạng thái thành công', { variant: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Lỗi khi cập nhật trạng thái', { variant: 'error' });
    } finally {
      setLoadingStatus(null);
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
  const handleOpenImage = (imageUrl: string) => {
    if (!imageUrl) return;
    setSelectedImage(imageUrl); // Chỉ cần set selectedImage để mở modal
  };

  const handleCloseImage = () => setSelectedImage(null);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await axiosInstance.delete(`/rentals/${deleteId}`);
        fetchRentals();
        enqueueSnackbar('Đã xóa đơn thuê thành công', {variant: 'success'});
      } catch (error) {
        console.error('Error deleting rental:', error);
        enqueueSnackbar('Lỗi khi xóa đơn thuê', {variant: 'error'});
      }
    }
    setOpenDeleteDialog(false);
  };

  const handleOpenCCCD = (rental: Rental) => {
    console.log('Opening CCCD for rental:', rental);
    console.log('CCCD Info:', rental.cccdInfo);

    // Không cần parse nữa vì dữ liệu đã là object
    setSelectedCCCD({
      image: rental.identityCard,
      info: rental.cccdInfo as CCCDInfo // Type assertion vì chúng ta biết đây là object
    });
    setCccdDialogOpen(true);
  };

  const filteredRentals = rentals.filter((rental) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      rental.orderCode.toLowerCase().includes(searchLower) ||
      rental.customerName.toLowerCase().includes(searchLower) ||
      rental.phone.toLowerCase().includes(searchLower) ||
      rental.clothes.name.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || rental.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang duyệt';
      case 'pending_payment':
        return 'Chờ thanh toán';
      case 'approved':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'rejected':
        return 'Từ chối';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Chờ xác nhận'; // Thay vì "Không xác định"
    }
  };

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

      {/* Thêm phần Search và Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo mã đơn, tên khách, SĐT, tên sản phẩm..."
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

      {filteredRentals.length === 0 ? (
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{textAlign: 'center'}}>Mã đơn</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Khách hàng</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Số điện thoại</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Sản phẩm</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Ngày thuê</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Ngày trả</TableCell>

                <TableCell sx={{textAlign: 'center'}}>Tổng tiền</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Info CCCD</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Trạng thái</TableCell>
                <TableCell sx={{textAlign: 'center'}}>Thao tác</TableCell>
              </TableRow>

            </TableHead>
            <TableBody>
              {filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell sx={{textAlign: 'center'}}>{rental.orderCode}</TableCell>
                  <TableCell sx={{textAlign: 'center'}}>{rental.customerName}</TableCell>
                  <TableCell sx={{textAlign: 'center'}}>{rental.phone}</TableCell>
                  <TableCell sx={{textAlign: 'center'}}>{rental.clothes.name}</TableCell>
                  <TableCell sx={{textAlign: 'center'}}>

                    {format(new Date(rental.rentDate), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell sx={{textAlign: 'center'}}>
                    {format(new Date(rental.returnDate), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN').format(rental.totalAmount)}đ
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', width: '100px' }}>
                    {rental.identityCard ? (
                      <Tooltip title="Xem Info CCCD">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenCCCD(rental)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '&:hover': {
                              color: theme.palette.secondary.main
                            }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderStatus status={rental.status} />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      {loadingStatus === rental.id ? (
                        <Box display="flex" justifyContent="center">
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
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
                      )}
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      sx={{ 
                        color: '#FF69B4',
                        '&:hover': { 
                          backgroundColor: '#FFF0F5',
                          color: '#FF1493'
                        }
                      }}
                      onClick={() => handleDelete(rental.id)}
                      disabled={rental.status === 'approved'}
                    >
                      <Delete />
                    </IconButton>
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
            <Box sx={{ position: 'relative' }}>
              <img
                src={selectedImage}
                alt="CCCD"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '4px'
                }}
              />
              <IconButton
                onClick={handleCloseImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa đơn thuê</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa đơn thuê này? Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={confirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <CCCDInfoDialog
        open={cccdDialogOpen}
        onClose={() => setCccdDialogOpen(false)}
        cccdImage={selectedCCCD?.image || ''}
        cccdInfo={selectedCCCD?.info}
      />
    </Container>
  );
};

export default Rentals; 