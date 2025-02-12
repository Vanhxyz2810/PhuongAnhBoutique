import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link
} from '@mui/material';
import { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../utils/axios';
import { enqueueSnackbar } from 'notistack';
const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', formData);
      const { user, token } = response.data;
      
      console.log('Login successful:', { user, token });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuth(user, token);
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AxiosError) {
        enqueueSnackbar(error.response?.data?.message || 'Đăng nhập thất bại', { variant: 'error' });
      } else {
        enqueueSnackbar('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.', { variant: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Đăng Nhập
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng Nhập
            </Button>
            <Box textAlign="center">
              <Link href="/register" variant="body2">
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 