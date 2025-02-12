import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import FeedbackIcon from '@mui/icons-material/Feedback';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const adminMenuItems = [
    {
      text: 'Đánh giá',
      path: '/feedbacks',
      icon: <FeedbackIcon />
    }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      overflow: 'hidden' // Prevent horizontal scroll
    }}>
      <Header />
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
        mt: { xs: 1, sm: 2 }, // Responsive margin
        width: '100%',
        overflowX: 'auto' // Enable horizontal scroll for tables
      }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;