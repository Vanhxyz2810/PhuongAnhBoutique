import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import { Home, Checkroom, People, Receipt, Assessment } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../../assets/images/pa.jpg';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { text: 'Trang Chủ', icon: <Home />, path: '/' },
    { text: 'Quần Áo', icon: <Checkroom />, path: '/clothes' },
    { text: 'Khách Hàng', icon: <People />, path: '/customers' },
    { text: 'Đơn Thuê', icon: <Receipt />, path: '/rentals' },
    { text: 'Doanh Thu', icon: <Assessment />, path: '/revenue' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          src={logoImage}
          sx={{ 
            width: 80, 
            height: 80,
            mb: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            '& img': {
              objectFit: 'cover'
            }
          }}
        />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          PA Boutique
        </Typography>
      </Box>
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 2,
                backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                textDecoration: 'none'
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path ? '#FF1493' : '#FF69B4'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? '#FF1493' : '#FF69B4',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 