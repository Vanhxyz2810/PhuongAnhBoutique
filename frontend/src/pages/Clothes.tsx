import { 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useState } from 'react';

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  status: 'available' | 'rented';
  startDate?: Date;
  endDate?: Date;
}

const ClothesPage = () => {
  const [open, setOpen] = useState(false);
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    rentalPrice: '',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    const newClothes: Clothes = {
      id: Date.now().toString(),
      name: formData.name,
      ownerName: formData.ownerName, 
      rentalPrice: Number(formData.rentalPrice),
      status: 'available'
    };
    setClothes([...clothes, newClothes]);
    handleClose();
    setFormData({ name: '', ownerName: '', rentalPrice: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản Lý Quần Áo</h1>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Thêm Mới
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Bộ Quần Áo</TableCell>
              <TableCell>Người Cho Thuê</TableCell>
              <TableCell>Giá Thuê</TableCell>
              <TableCell>Tình Trạng</TableCell>
              <TableCell>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clothes.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.ownerName}</TableCell>
                <TableCell>{item.rentalPrice.toLocaleString()}đ</TableCell>
                <TableCell>
                  {item.status === 'available' ? 'Có sẵn' : 'Đang thuê'}
                </TableCell>
                <TableCell>
                  <IconButton>
                    <Edit />
                  </IconButton>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Thêm Bộ Quần Áo Mới</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              fullWidth
              label="Tên Bộ Quần Áo"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <TextField
              fullWidth
              label="Người Cho Thuê"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
            />
            <TextField
              fullWidth
              label="Giá Thuê"
              type="number"
              value={formData.rentalPrice}
              onChange={(e) => setFormData({...formData, rentalPrice: e.target.value})}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClothesPage; 