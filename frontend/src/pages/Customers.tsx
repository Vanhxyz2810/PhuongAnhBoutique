import { useState, useEffect, ChangeEvent } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { AxiosError } from 'axios';

interface ClothesItem {
  id: string;
  name: string;
  rentalPrice: number;
  status: 'available' | 'rented';
}

interface SelectedClothes {
  id: string;
  quantity: number;
}

const Customers = () => {
  const [clothes, setClothes] = useState<ClothesItem[]>([]);
  const [selectedClothes, setSelectedClothes] = useState<SelectedClothes[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityCard, setIdentityCard] = useState<File | null>(null);
  const [rentDate, setRentDate] = useState<Date | null>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/clothes');
        setClothes(response.data.filter((item: ClothesItem) => item.status === 'available'));
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };
    fetchClothes();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddClothes = () => {
    setSelectedClothes([...selectedClothes, { id: '', quantity: 1 }]);
  };

  const handleRemoveClothes = (index: number) => {
    const newSelectedClothes = [...selectedClothes];
    newSelectedClothes.splice(index, 1);
    setSelectedClothes(newSelectedClothes);
  };

  const calculateTotal = () => {
    return selectedClothes.reduce((total, item) => {
      const clothesItem = clothes.find(c => c.id === item.id);
      return total + (clothesItem?.rentalPrice || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rentalFormData = new FormData();
      rentalFormData.append('customerName', customerName);
      rentalFormData.append('phone', phone);
      if (rentDate) {
        rentalFormData.append('rentDate', rentDate.toISOString());
      }
      if (returnDate) {
        rentalFormData.append('returnDate', returnDate.toISOString());
      }
      rentalFormData.append('totalAmount', calculateTotal().toString());
      
      // Đảm bảo chỉ gửi một clothesId
      if (selectedClothes && selectedClothes.length > 0) {
        rentalFormData.append('clothesId', selectedClothes[0].id);
      }

      console.log('Submitting rental data:', {
        customerName,
        phone,
        rentDate: rentDate?.toISOString(),
        returnDate: returnDate?.toISOString(),
        totalAmount: calculateTotal(),
        clothesId: selectedClothes?.[0]?.id
      });

      const response = await axiosInstance.post('/rentals', rentalFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        alert('Tạo đơn thuê thành công!');
        setCustomerName('');
        setPhone('');
        setIdentityCard(null);
        setRentDate(new Date());
        setReturnDate(null);
        setSelectedClothes([]);
        setIsPaid(false);
        navigate('/rentals');
      }
    } catch (error) {
      console.error('Rental creation error:', error);
      if (error instanceof AxiosError) {
        // Hiển thị message từ server nếu có
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuê');
      } else {
        alert('Có lỗi xảy ra khi tạo đơn thuê');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdentityCard(file);
  };

  const handleDateChange = (date: Date | null, field: 'rent' | 'return') => {
    if (field === 'rent') {
      setRentDate(date);
    } else {
      setReturnDate(date);
    }
  };

  const handleClothesChange = (index: number, value: string) => {
    const newSelectedClothes = [...selectedClothes];
    newSelectedClothes[index].id = value;
    setSelectedClothes(newSelectedClothes);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const newSelectedClothes = [...selectedClothes];
    newSelectedClothes[index].quantity = value;
    setSelectedClothes(newSelectedClothes);
  };

  return (
    <Container maxWidth="lg">
      <Typography 
          variant="h4" 
          sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: 'primary.main'
          }}
        >
          Tạo Đơn Thuê Mới
        </Typography>
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload CCCD
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {identityCard && (
                <Chip
                  label={identityCard.name}
                  onDelete={() => setIdentityCard(null)}
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddClothes}
                  variant="contained"
                >
                  Thêm quần áo
                </Button>
              </Box>

              {selectedClothes.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Chọn quần áo</InputLabel>
                    <Select
                      value={item.id}
                      onChange={(e) => handleClothesChange(index, e.target.value)}
                    >
                      {clothes.map((clothesItem) => (
                        <MenuItem key={clothesItem.id} value={clothesItem.id}>
                          {clothesItem.name} - {clothesItem.rentalPrice.toLocaleString()}đ
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    type="number"
                    label="Số lượng"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    sx={{ width: '100px' }}
                  />

                  <IconButton onClick={() => handleRemoveClothes(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày thuê"
                  value={rentDate}
                  onChange={(newValue) => handleDateChange(newValue, 'rent')}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày trả"
                  value={returnDate}
                  onChange={(newValue) => handleDateChange(newValue, 'return')}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái thanh toán</InputLabel>
                <Select
                  value={isPaid}
                  onChange={(e) => setIsPaid(e.target.value === 'true')}
                >
                  <MenuItem value="true">Đã thanh toán</MenuItem>
                  <MenuItem value="false">Chưa thanh toán</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">
                Tổng tiền: {calculateTotal().toLocaleString()}đ
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Tạo đơn thuê
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Customers; 