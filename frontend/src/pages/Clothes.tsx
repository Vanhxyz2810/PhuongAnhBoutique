import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  status: 'available' | 'rented';
  image: string;
  description?: string;
}

interface FormData {
  name: string;
  ownerName: string;
  rentalPrice: string;
  description: string;
  status: 'available' | 'rented';
}

const API_URL = 'http://localhost:5001/api/clothes';

const Clothes = () => {
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ownerName: '',
    rentalPrice: '',
    description: '',
    status: 'available'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data when component mounts
  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClothes(response.data);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form - Chỉ kiểm tra imagePreview khi thêm mới
      if (!formData.name || !formData.ownerName || !formData.rentalPrice) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      // Kiểm tra ảnh chỉ khi thêm mới
      if (!editingId && !imagePreview) {
        alert('Vui lòng chọn ảnh');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('ownerName', formData.ownerName.trim());
      formDataToSend.append('rentalPrice', formData.rentalPrice);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('image', fileInputRef.current.files[0]);
      }

      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, formDataToSend);
        console.log('Update response:', response.data);
      } else {
        const response = await axios.post(API_URL, formDataToSend);
        console.log('Create response:', response.data);
      }

      await fetchClothes();
      setOpen(false);
      setEditingId(null);
      setFormData({ name: '', ownerName: '', rentalPrice: '', description: '', status: 'available' });
      setImagePreview(null);

    } catch (error: any) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchClothes(); // Refresh data
    } catch (error) {
      console.error('Error deleting clothes:', error);
    }
  };

  const handleEdit = (item: Clothes) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      ownerName: item.ownerName,
      rentalPrice: item.rentalPrice.toString(),
      description: item.description || '',
      status: item.status
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Quần Áo</h1>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{
            borderRadius: '20px',
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(255, 141, 199, 0.2)'
            }
          }}
          onClick={() => setOpen(true)}
        >
          Thêm Mới
        </Button>
      </div>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          '& .MuiTableCell-head': {
            backgroundColor: '#FFF0F5',
            color: '#FF1493',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#FFF9FB'
          },
          '& .MuiTableCell-body': {
            fontSize: '0.9rem',
            py: 2
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="20%" align="center">Tên Bộ Quần Áo</TableCell>
              <TableCell width="20%" align="center">Người Cho Thuê</TableCell>
              <TableCell width="15%" align="center">Giá Thuê</TableCell>
              <TableCell width="15%" align="center">Ảnh</TableCell>
              <TableCell width="15%" align="center">Tình Trạng</TableCell>
              <TableCell width="15%" align="center">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clothes.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 500 }} align="center">{item.name}</TableCell>
                <TableCell align="center">{item.ownerName}</TableCell>
                <TableCell align="center">{item.rentalPrice.toLocaleString()}đ</TableCell>
                <TableCell align="center">
                  <img 
                    src={`http://localhost:5001${item.image}`} 
                    alt={item.name}
                    style={{ 
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      margin: '0 auto'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={item.status === 'available' ? 'Có sẵn' : 'Đang thuê'}
                    color={item.status === 'available' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    onClick={() => handleEdit(item)}
                    sx={{ 
                      color: '#FF69B4',
                      '&:hover': { backgroundColor: '#FFF0F5' }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(item.id)}
                    sx={{ 
                      color: '#FF69B4',
                      '&:hover': { 
                        backgroundColor: '#FFF0F5',
                        color: '#FF1493'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {clothes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Dialog */}
      <Box role="presentation">
        <Dialog 
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="clothes-dialog-title"
        >
          <DialogTitle id="clothes-dialog-title">
            {editingId ? 'Cập Nhật Quần Áo' : 'Thêm Quần Áo Mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Image Upload */}
              <Box
                sx={{
                  border: '2px dashed #FF8DC7',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#FFF0F5' }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 40, color: '#FF8DC7', mb: 1 }} />
                    <Typography>Click để tải ảnh lên</Typography>
                  </>
                )}
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>

              {/* Existing form fields */}
              <TextField
                label="Tên Bộ Quần Áo"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Người Cho Thuê"
                fullWidth
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
              <TextField
                label="Giá Thuê"
                type="number"
                fullWidth
                value={formData.rentalPrice}
                onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })}
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Tình trạng</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'rented' })}
                >
                  <MenuItem value="available">Có sẵn</MenuItem>
                  <MenuItem value="rented">Đang thuê</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingId(null);
              setFormData({ name: '', ownerName: '', rentalPrice: '', description: '', status: 'available' });
            }}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={
                !formData.name || 
                !formData.ownerName || 
                !formData.rentalPrice || 
                (!editingId && !imagePreview)
              }
            >
              {editingId ? 'Cập Nhật' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default Clothes; 