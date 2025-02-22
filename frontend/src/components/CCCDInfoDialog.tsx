import { Dialog, DialogTitle, DialogContent, Typography, Box, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CCCDInfo } from '../types/cccd';

interface CCCDInfoDialogProps {
  open: boolean;
  onClose: () => void;
  cccdImage: string;
  cccdInfo?: CCCDInfo;
}

const CCCDInfoDialog = ({ open, onClose, cccdImage, cccdInfo }: CCCDInfoDialogProps) => {
  console.log('Dialog CCCD Info:', cccdInfo);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}>
        Thông tin CCCD
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Ảnh CCCD */}
          <Grid item xs={12}>
            <Box sx={{
              width: '100%',
              height: '300px',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 3
            }}>
              <img
                src={cccdImage}
                alt="CCCD"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5'
                }}
              />
            </Box>
          </Grid>

          {/* Thông tin CCCD */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              border: '1px solid #eee'
            }}>
              {cccdInfo ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Số CCCD:</strong> {cccdInfo.cccd}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Họ tên:</strong> {cccdInfo.hoTen}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Ngày sinh:</strong> {cccdInfo.ngaySinh}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Giới tính:</strong> {cccdInfo.gioiTinh}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Quê quán:</strong> {cccdInfo.queQuan}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Nơi thường trú:</strong> {cccdInfo.noiThuongTru}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  Không có thông tin CCCD
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CCCDInfoDialog; 