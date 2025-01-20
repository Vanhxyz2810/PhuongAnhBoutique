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
import axios, { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', formData);
      console.log('Register response:', response.data);
      
      const { token, user } = response.data;
      setAuth(user, token);
      
      navigate('/');
    } catch (err) {
      const error = err as Error | AxiosError;
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Đăng ký thất bại');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
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
            Đăng Ký
          </Typography>
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
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
              label="Họ tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng Ký
            </Button>
            <Box textAlign="center">
              <Link href="/login" variant="body2">
                Đã có tài khoản? Đăng nhập
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 