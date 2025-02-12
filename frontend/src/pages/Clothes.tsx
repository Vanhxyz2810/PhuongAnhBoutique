import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
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
  MenuItem,
  Container
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  description: string;
  status: 'available' | 'rented';
  category: string;
  image: string;
}

interface FormData {
  name: string;
  ownerName: string;
  rentalPrice: string;
  description: string;
  status: 'available' | 'rented';
  category: string;
}

interface Category {
  id: number;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL + '/clothes';

const Clothes = () => {
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ownerName: '',
    rentalPrice: '',
    description: '',
    status: 'available',
    category: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Fetch data when component mounts
  useEffect(() => {
    fetchClothes();
    fetchCategories();
  }, []);

  const fetchClothes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClothes(response.data);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/clothes/categories/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        enqueueSnackbar('Không tìm thấy token', { variant: 'error' });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('rentalPrice', formData.rentalPrice);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('category', formData.category);

      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('image', fileInputRef.current.files[0]);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (!formData.name || !formData.ownerName || !formData.rentalPrice) {
        enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
        return;
      }

      if (!editingId && !imagePreview) {
        enqueueSnackbar('Vui lòng chọn ảnh', { variant: 'warning' });
        return;
      }

      if (editingId) {
        await axiosInstance.put(`/clothes/${editingId}`, formDataToSend, config);
      } else {
        await axiosInstance.post('/clothes', formDataToSend, config);
      }

      fetchClothes(); // Refresh danh sách
      setOpen(false);
      setEditingId(null);
      setFormData({ name: '', ownerName: '', rentalPrice: '', description: '', status: 'available', category: '' });
      setImagePreview(null);
      enqueueSnackbar(
        editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        enqueueSnackbar(`Lỗi: ${error.message}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/clothes/${id}`);
      fetchClothes();
      enqueueSnackbar('Xóa thành công!', { variant: 'success' });
    } catch (error) {
      console.error('Error:', error);
      enqueueSnackbar('Lỗi khi xóa sản phẩm', { variant: 'error' });
    }
  };

  const handleEdit = (item: Clothes) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      ownerName: item.ownerName,
      rentalPrice: item.rentalPrice.toString(),
      description: item.description || '',
      status: item.status,
      category: item.category || ''
    });
    setOpen(true);
  };

  const handleCreateTestData = async () => {
    try {
      const testClothes = [
        {
          name: "Váy cưới trắng công chúa",
          ownerName: "Phương Anh",
          rentalPrice: 2000,
          description: "Váy cưới màu trắng, phong cách công chúa lộng lẫy",
          image: "https://res.cloudinary.com/dowioz8of/image/upload/v1737806494/izey2gfknuxlt6vabiae.jpg",
          status: "available"
        },
        {
          name: "Váy cưới đuôi cá sang trọng",
          ownerName: "Phương Anh",
          rentalPrice: 2000,
          description: "Váy cưới đuôi cá, thiết kế ôm body quyến rũ",
          image: "https://res.cloudinary.com/dowioz8of/image/upload/v1737806494/izey2gfknuxlt6vabiae.jpg",
          status: "available"
        },
        {
          name: "Váy cưới tay dài vintage",
          ownerName: "Phương Anh",
          rentalPrice: 2000,
          description: "Váy cưới tay dài phong cách vintage cổ điển",
          image: "https://res.cloudinary.com/dowioz8of/image/upload/v1737806494/izey2gfknuxlt6vabiae.jpg",
          status: "available"
        }
      ];

      for (const clothe of testClothes) {
        await axiosInstance.post('/clothes', clothe);
      }

      // Refresh danh sách sau khi tạo
      fetchClothes();
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await axiosInstance.post('/clothes/categories', { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
      setShowAddCategory(false);
      enqueueSnackbar('Thêm danh mục thành công!', { variant: 'success' });
    } catch (error) {
      console.error('Error adding category:', error);
      enqueueSnackbar('Lỗi khi thêm danh mục', { variant: 'error' });
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3}}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Quản Lý Quần Áo</Typography>
        <Box>


          {/* Thêm button test */}
          <Button
            onClick={() => setShowAddCategory(true)}
            startIcon={<AddIcon />}
            sx={{ mt: 1 }}
          >
            Thêm danh mục mới
          </Button>
          <Button 
            variant="outlined"
            onClick={handleCreateTestData}
            sx={{ 
              mt: 1,
              mr: 2,
              color: '#FF1493',
              borderColor: '#FF1493',
              '&:hover': {
                borderColor: '#FF69B4',
                backgroundColor: 'rgba(255,20,147,0.04)'
              }
            }}
          >
            Tạo dữ liệu test
          </Button>
          <Button 
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              mt: 1,
              bgcolor: '#FF1493',
              '&:hover': {
                bgcolor: '#FF69B4'
              }
            }}
          >
            Thêm trang phục
          </Button>
        </Box>
      </Box>

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
              <TableCell width="45%" align="center">Danh mục</TableCell>
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
                    src={item.image}
                    alt={item.name}
                    style={{ 
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px'
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
                <TableCell align="center">{item.category || 'Chưa phân loại'}</TableCell>
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
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setEditingId(null);
              setFormData({ name: '', ownerName: '', rentalPrice: '', description: '', status: 'available', category: '' });
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

      
    </Container>
  );
};

export default Clothes; 