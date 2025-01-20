import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider,
  Button
} from '@mui/material';
import {
  Facebook,
  Instagram,
  YouTube,
  Phone,
  LocationOn,
  Email,
  KeyboardArrowUp
} from '@mui/icons-material';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'white',
        borderTop: '1px solid #eaeaea',
        pt: 6,
        pb: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Thông tin công ty */}
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#FF90BC',
                fontWeight: 700,
                mb: 2
              }}
            >
              PA BOUTIQUE
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#4A4A4A',
                mb: 2,
                lineHeight: 1.6
              }}
            >
              Chuyên cho thuê váy đầm dạ hội, váy cưới, vest cưới cao cấp với giá cả hợp lý nhất. Cam kết chất lượng và dịch vụ tốt nhất cho khách hàng.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                sx={{ 
                  color: '#FF90BC',
                  '&:hover': { bgcolor: 'rgba(255, 144, 188, 0.08)' }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                href="https://instagram.com" 
                target="_blank"
                sx={{ 
                  color: '#FF90BC',
                  '&:hover': { bgcolor: 'rgba(255, 144, 188, 0.08)' }
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                href="https://youtube.com" 
                target="_blank"
                sx={{ 
                  color: '#FF90BC',
                  '&:hover': { bgcolor: 'rgba(255, 144, 188, 0.08)' }
                }}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Liên kết nhanh */}
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#4A4A4A',
                fontWeight: 700,
                mb: 2
              }}
            >
              Liên Kết Nhanh
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { text: 'Trang Chủ', href: '/' },
                { text: 'Sản Phẩm', href: '/products' },
                { text: 'Về Chúng Tôi', href: '/about' },
                { text: 'Chính Sách', href: '/policy' },
                { text: 'Liên Hệ', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  underline="none"
                  sx={{
                    color: '#4A4A4A',
                    '&:hover': { color: '#FF90BC' },
                    transition: 'color 0.2s'
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Thông tin liên hệ */}
          <Grid item xs={12} sm={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#4A4A4A',
                fontWeight: 700,
                mb: 2
              }}
            >
              Liên Hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocationOn sx={{ color: '#FF90BC' }} />
                <Typography variant="body2" sx={{ color: '#4A4A4A' }}>
                  123 Đường ABC, Quận XYZ, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Phone sx={{ color: '#FF90BC' }} />
                <Typography variant="body2" sx={{ color: '#4A4A4A' }}>
                  0123 456 789
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Email sx={{ color: '#FF90BC' }} />
                <Typography variant="body2" sx={{ color: '#4A4A4A' }}>
                  contact@paboutique.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: '#4A4A4A' }}>
            © {new Date().getFullYear()} PA Boutique. Đã đăng ký bản quyền.
          </Typography>
          <Button
            onClick={scrollToTop}
            startIcon={<KeyboardArrowUp />}
            sx={{
              color: '#FF90BC',
              '&:hover': { bgcolor: 'rgba(255, 144, 188, 0.08)' }
            }}
          >
            Lên đầu trang
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 