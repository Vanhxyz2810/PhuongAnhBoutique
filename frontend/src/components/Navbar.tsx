import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppBar, Toolbar, Button, Box, Typography, Container } from '@mui/material';
// import React from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          padding: '8px 0'
        }}>
          {/* Logo/Trang chủ */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            PA BOUTIQUE
          </Typography>

          {/* Menu chính */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flex: 1,
            justifyContent: 'center'
          }}>
            {user ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/my-orders"
                  sx={{ color: 'white' }}
                >
                  Đơn Hàng Của Tôi
                </Button>
                
                {user.role === 'admin' && (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/rentals"
                      sx={{ color: 'white' }}
                    >
                      Quản Lý Đơn Hàng
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/clothes"
                      sx={{ color: 'white' }}
                    >
                      Quản Lý Sản Phẩm
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/dashboard"
                      sx={{ color: 'white' }}
                    >
                      Thống Kê
                    </Button>
                  </>
                )}
              </>
            ) : null}
          </Box>

          {/* Phần đăng nhập/đăng ký/đăng xuất */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            {user ? (
              <>
                <Typography sx={{ color: 'white' }}>
                  Xin chào, {user.name}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Đăng Xuất
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ color: 'white' }}
                >
                  Đăng Nhập
                </Button>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/register"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Đăng Ký
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 