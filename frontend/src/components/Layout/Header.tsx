import { 
  AppBar, 
  Toolbar, 
  Box,
  Button,
  Container,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  Home,
  Checkroom,
  People,
  Receipt,
  Assessment,
  Notifications 
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const menuItems = [
    { text: 'Trang Chủ', icon: <Home />, path: '/' },
    { text: 'Quần Áo', icon: <Checkroom />, path: '/clothes' },
    { text: 'Khách Hàng', icon: <People />, path: '/customers' },
    { text: 'Đơn Thuê', icon: <Receipt />, path: '/rentals' },
    { text: 'Doanh Thu', icon: <Assessment />, path: '/revenue' },
  ];

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Avatar 
            src="/path-to-logo.png"
            sx={{ 
              width: 40, 
              height: 40,
              mr: 2,
              border: '2px solid',
              borderColor: 'primary.main'
            }}
          />

          {/* Menu Items */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <Notifications />
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 