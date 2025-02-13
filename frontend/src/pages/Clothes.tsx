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
  Container,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  description: string;
  status: 'available' | 'rented';
  category: string;
  image: string;
  isPinned: boolean;
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: number, name: string} | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
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
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      
      // Tạo previews
      const previewUrls = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('rentalPrice', formData.rentalPrice);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('category', formData.category);

      // Append multiple images
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (!formData.name || !formData.ownerName || !formData.rentalPrice) {
        enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
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
      setImageFiles([]);
      setImagePreviews([]);
      enqueueSnackbar(
        editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar('Có lỗi xảy ra khi lưu', { variant: 'error' });
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
      console.log('Attempting to add category:', newCategoryName);
      
      // Kiểm tra trùng tên
      const duplicate = categories.find(cat => 
        cat.name.toLowerCase() === newCategoryName.toLowerCase()
      );
      
      if (duplicate) {
        console.log('Duplicate category found:', duplicate);
        enqueueSnackbar('Danh mục không được trùng tên', { variant: 'warning' });
        return;
      }

      const response = await axiosInstance.post('/clothes/categories', { 
        name: newCategoryName 
      });
      console.log('Category creation response:', response.data);

      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setCategoryDialogOpen(false);
      enqueueSnackbar('Thêm danh mục thành công', { variant: 'success' });
    } catch (error: any) {
      console.error('Error adding category:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: 'warning' });
      } else {
        enqueueSnackbar('Lỗi khi thêm danh mục', { variant: 'error' });
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await axiosInstance.put(`/clothes/categories/${editingCategory.id}`, {
        name: newCategoryName
      });
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? {...cat, name: newCategoryName} : cat
      );
      setCategories(updatedCategories);
      setNewCategoryName('');
      setEditingCategory(null);
      setCategoryDialogOpen(false);
      enqueueSnackbar('Cập nhật danh mục thành công', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Lỗi khi cập nhật danh mục', { variant: 'error' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await axiosInstance.delete(`/clothes/categories/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
      enqueueSnackbar('Xóa danh mục thành công', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Lỗi khi xóa danh mục', { variant: 'error' });
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3}}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Quản Lý Quần Áo</Typography>
        <Box>
          {/* Thêm button test */}
          <Button
            variant="outlined"
            onClick={() => setCategoryDialogOpen(true)}
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
                  <IconButton 
                  sx={{ 
                    color: '#FF69B4',
                    '&:hover': { 
                      backgroundColor: '#FFF0F5',
                      color: '#FF1493'
                    }
                  }}
                    onClick={async () => {
                      try {
                        await axiosInstance.patch(`/clothes/${item.id}/toggle-pin`);
                        fetchClothes();
                        enqueueSnackbar(
                          item.isPinned ? 'Đã bỏ ghim sản phẩm' : 'Đã ghim sản phẩm',
                          { variant: 'success' }
                        );
                      } catch (error) {
                        console.error('Error toggling pin:', error);
                        enqueueSnackbar('Lỗi khi thực hiện thao tác', { variant: 'error' });
                      }
                    }}
                  >
                    {item.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
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
              <FormControl fullWidth sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" fullWidth>
                    Chọn ảnh
                  </Button>
                </label>
              </FormControl>

              {imagePreviews.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {imagePreviews.map((preview, index) => (
                    <img 
                      key={index}
                      src={preview}
                      alt={`preview ${index}`}
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  ))}
                </Box>
              )}

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
                (!editingId && imageFiles.length === 0)
              }
            >
              {editingId ? 'Cập Nhật' : 'Lưu'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Dialog open={categoryDialogOpen} onClose={() => {
        setCategoryDialogOpen(false);
        setEditingCategory(null);
        setNewCategoryName('');
      }}>
        <DialogTitle>
          {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Tên danh mục"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </Box>
          {!editingCategory && (
            <List sx={{ mt: 2 }}>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <Box>
                      <IconButton 
                        edge="end" 
                        onClick={() => {
                          setEditingCategory(category);
                          setNewCategoryName(category.name);
                        }}
                        sx={{ color: 'primary.main', mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteCategory(category.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCategoryDialogOpen(false);
            setEditingCategory(null);
            setNewCategoryName('');
          }}>
            Hủy
          </Button>
          <Button 
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            variant="contained"
            disabled={!newCategoryName.trim()}
          >
            {editingCategory ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Clothes; 