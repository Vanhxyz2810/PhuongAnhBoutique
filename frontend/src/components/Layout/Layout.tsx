import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;