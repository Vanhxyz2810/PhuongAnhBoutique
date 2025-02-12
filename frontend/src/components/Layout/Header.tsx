import { 
  AppBar, 
  Toolbar, 
  Box,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  MenuItem
} from '@mui/material';
import { 
  Home,
  Checkroom,
  People,
  Receipt,
  Assessment,
  Menu,
  ShoppingBag,
  ExitToApp,
  Feedback
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const theme = {
  colors: {
    primary: '#FF90BC'
  }
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Trang Chủ', icon: <Home />, path: '/' },
    { text: 'Đơn Hàng Của Tôi', icon: <ShoppingBag />, path: '/my-orders' },
    ...(user?.role === 'admin' ? [
      { text: 'Quản Lý Quần Áo', icon: <Checkroom />, path: '/clothes' },
      { text: 'Khách Hàng', icon: <People />, path: '/customers' },
      { text: 'Đơn Thuê', icon: <Receipt />, path: '/rentals' },
      { text: 'Doanh Thu', icon: <Assessment />, path: '/revenue' },
      { text: 'Feedback', icon: <Feedback />, path: '/feedbacks' }
    ] : [])
  ];

  // const adminMenuItems = [
  //   { text: 'Trang phục', path: '/clothes', icon: <Checkroom /> },
  //   { text: 'Đơn thuê', path: '/rentals', icon: <Receipt /> },
  //   { text: 'Khách hàng', path: '/customers', icon: <People /> },
  //   { text: 'Doanh thu', path: '/revenue', icon: <Assessment /> },
  //   { text: 'Đánh giá', path: '/feedbacks', icon: <Feedback /> }
  // ];

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
      {/* Top bar */}
      <Box 
        sx={{ 
          bgcolor: '#FF90BC',
          color: 'white',
          py: 0.5,
          textAlign: 'center',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          fontWeight: 500
        }}
      >
        🌸 Chào mừng đến với PA BOUTIQUE - Cho thuê trang phục đẹp, giá tốt nhất! 🌸
      </Box>

      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #eaeaea'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar 
            disableGutters 
            sx={{ 
              minHeight: { xs: 56, sm: 70 },
              px: { xs: 1, sm: 2 },
              gap: 1
            }}
          >
            {/* Mobile menu button */}
            <IconButton
              sx={{ 
                display: { sm: 'none' },
                color: '#4A4A4A'
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu />
            </IconButton>

            {/* Logo và tên thương hiệu */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <img 
                src="/images/pa_img.png"
                alt="PA Boutique Logo"
                style={{ 
                  height: 47,
                  width: 47,
                  borderRadius: '50%',
                  marginRight: '8px'  // Thêm khoảng cách giữa logo và text
                }}
              />
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{
                  // fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: theme.colors.primary,
                  textDecoration: 'none',
                }}
              >
                PA BOUTIQUE
              </Typography>
            </Box>

            {/* Desktop menu */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', sm: 'flex' }, 
              gap: 1,
              justifyContent: 'center',
              overflow: 'auto'
            }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: '#4A4A4A',
                    fontSize: '0.95rem',
                    px: { sm: 1, md: 2 },
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    '&:hover': {
                      bgcolor: 'rgba(255, 144, 188, 0.08)',
                      color: '#FF90BC'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            {/* Right side */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 2 },
              ml: 'auto'
            }}>
              {user ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    py: 0.5,
                    px: { xs: 1, sm: 2 },
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 144, 188, 0.08)',
                  }}
                >
                  <Typography 
                    sx={{ 
                      color: '#4A4A4A',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    startIcon={<ExitToApp />}
                    sx={{
                      color: '#FF90BC',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: { xs: 1, sm: 2 },
                      '& .MuiButton-startIcon': {
                        mr: { xs: 0, sm: 1 }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 144, 188, 0.12)'
                      },
                      '& span': {
                        display: { xs: 'none', sm: 'block' }
                      }
                    }}
                  >
                    <span>Đăng Xuất</span>
                  </Button>
                </Box>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{
                      color: '#4A4A4A',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': {
                        color: '#FF90BC'
                      }
                    }}
                  >
                    Đăng Nhập
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      bgcolor: '#FF90BC',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      px: 3,
                      '&:hover': {
                        bgcolor: '#FF1493'
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

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ 
          display: { sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          }
        }}
      >
        {/* Header của drawer */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #eaeaea',
          bgcolor: 'rgba(255, 144, 188, 0.08)',
        }}>
          <Typography variant="h6" sx={{ color: '#FF90BC', fontWeight: 700 }}>
            PA BOUTIQUE
          </Typography>
          {user && (
            <Typography sx={{ 
              color: '#4A4A4A',
              mt: 1,
              fontSize: '0.9rem'
            }}>
              Xin chào, {user.name}
            </Typography>
          )}
        </Box>

        {/* Menu items */}
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                color: '#4A4A4A',
                '&:hover': {
                  bgcolor: 'rgba(255, 144, 188, 0.08)',
                  color: '#FF90BC'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem'
                }}
              />
            </ListItem>
          ))}
          
        </List>

        {/* Đăng nhập/Đăng xuất ở cuối drawer */}
        <Box sx={{ p: 2, borderTop: '1px solid #eaeaea' }}>
          {user ? (
            <Button
              fullWidth
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              startIcon={<ExitToApp />}
              sx={{
                color: '#FF90BC',
                justifyContent: 'flex-start',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255, 144, 188, 0.08)'
                }
              }}
            >
              Đăng Xuất
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                onClick={() => setMobileOpen(false)}
                sx={{
                  flex: 1,
                  color: '#4A4A4A',
                  textTransform: 'none'
                }}
              >
                Đăng Nhập
              </Button>
              <Button
                component={Link}
                to="/register"
                onClick={() => setMobileOpen(false)}
                variant="contained"
                sx={{
                  flex: 1,
                  bgcolor: '#FF90BC',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#FF1493'
                  }
                }}
              >
                Đăng Ký
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Header; 