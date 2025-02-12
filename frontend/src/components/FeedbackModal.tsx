import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { AddPhotoAlternate, Close } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useSnackbar } from 'notistack';
interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    message: string;
    images: File[];
  }) => void;
}

const FeedbackModal = ({ open, onClose, onSubmit }: FeedbackModalProps) => {
  const [rating, setRating] = useState<number | null>(0);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
    enqueueSnackbar('Chỉ được tải lên tối đa 4 ảnh', {variant: "warning"})
      return;
    }
    setImages([...images, ...files]);
  };

  const handleSubmit = () => {
    onSubmit({
      rating: rating || 0,
      message,
      images
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Gửi Feedback
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography color="primary" gutterBottom>
            Đánh giá của bạn
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
          />
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Lời nhắn"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box>
          <Typography color="primary" gutterBottom>
            Hình ảnh (tối đa 4 ảnh)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {images.map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100
                }}
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`feedback-${idx}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {images.length < 4 && (
              <Button
                component="label"
                sx={{
                  width: 100,
                  height: 100,
                  border: '2px dashed',
                  borderColor: 'primary.main'
                }}
              >
                <AddPhotoAlternate />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!rating}
        >
          Gửi feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal; 