import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  InputBase,
  Box,
  Avatar
} from '@mui/material';
import { Search, Notifications } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'primary.light' }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: '4px 8px',
              width: 300,
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Search sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase placeholder="Tìm kiếm..." />
          </Box>
        </Box>
        
        <IconButton sx={{ mr: 2 }}>
          <Notifications />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 