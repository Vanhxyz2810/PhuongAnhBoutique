import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box
} from '@mui/material';
import axios from 'axios';
import { Visibility, Close } from '@mui/icons-material';

interface Rental {
  id: number;
  customerName: string;
  clothesIds: string[];
  quantities: number[];
  rentDate: string;
  returnDate: string;
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
  clothes?: { name: string }[];
  identityCard: string;
}

interface ClothesData {
  id: string;
  name: string;
}

const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [clothesMap, setClothesMap] = useState<{[key: string]: string}>({});
  const [openIdentityModal, setOpenIdentityModal] = useState(false);
  const [selectedIdentityCard, setSelectedIdentityCard] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rentals
        const rentalsResponse = await axios.get('http://localhost:5001/api/rentals');
        
        // Fetch all clothes để lấy tên
        const clothesResponse = await axios.get('http://localhost:5001/api/clothes');
        const clothesData = clothesResponse.data.reduce((acc: {[key: string]: string}, item: ClothesData) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
        
        setClothesMap(clothesData);
        setRentals(rentalsResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getClothesNames = (clothesIds: string[]) => {
    return clothesIds.map(id => clothesMap[id]).join(', ');
  };

  const handleViewIdentityCard = (identityCardPath: string) => {
    setSelectedIdentityCard(identityCardPath);
    setOpenIdentityModal(true);
  };

  const handlePaymentStatusChange = async (rentalId: number, currentStatus: boolean) => {
    try {
      await axios.patch(`http://localhost:5001/api/rentals/${rentalId}/payment-status`, {
        isPaid: !currentStatus
      });
      
      // Cập nhật state local
      setRentals(rentals.map(rental => 
        rental.id === rentalId 
          ? { ...rental, isPaid: !rental.isPaid }
          : rental
      ));
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const calculateTotalRevenue = () => {
    return rentals
      .filter(rental => rental.isPaid)
      .reduce((total, rental) => total + rental.totalAmount, 0);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>Danh Sách Đơn Thuê</Typography>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid',
          borderColor: 'primary.light'
        }}
      >
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontWeight: 500 
            }}
          >
            Tổng Doanh Thu (Đã Thanh Toán)
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#FF1493',
              fontWeight: 'bold' 
            }}
          >
            {calculateTotalRevenue().toLocaleString()}đ
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontWeight: 500
            }}
          >
            Số Đơn Đã Thanh Toán
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#FF1493',
              fontWeight: 'bold'
            }}
          >
            {rentals.filter(rental => rental.isPaid).length} / {rentals.length}
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mã Đơn</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Khách Hàng</TableCell>
              
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Sản Phẩm</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ngày Thuê</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ngày Trả</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tổng Tiền</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>CCCD</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ngày Tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell align="center">ĐT{rental.id.toString().padStart(4, '0')}</TableCell>
                <TableCell align="center" >{rental.customerName}</TableCell>
                
                <TableCell align="center">{getClothesNames(rental.clothesIds)}</TableCell>
                <TableCell align="center">{formatDate(rental.rentDate)}</TableCell>
                <TableCell align="center">{formatDate(rental.returnDate)}</TableCell>
                <TableCell align="right">
                  {rental.totalAmount.toLocaleString()}đ
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={rental.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    color={rental.isPaid ? "success" : "error"}
                    size="small"
                    onClick={() => handlePaymentStatusChange(rental.id, rental.isPaid)}
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    onClick={() => handleViewIdentityCard(rental.identityCard)}
                    color="primary"
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
                <TableCell align="center">{formatDate(rental.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openIdentityModal} 
        onClose={() => setOpenIdentityModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Ảnh CCCD
          <IconButton
            onClick={() => setOpenIdentityModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={`http://localhost:5001${selectedIdentityCard}`}
            alt="CCCD"
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Rentals; 