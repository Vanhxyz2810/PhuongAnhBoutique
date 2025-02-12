import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  Box,
  ImageList,
  ImageListItem,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { theme } from '../theme';

interface Feedback {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  feedbackMessage: string;
  feedbackImages: string[];
  feedbackAt: string;
  clothes: {
    name: string;
    image: string;
  };
}

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const response = await axiosInstance.get('/rentals/feedbacks');
      setFeedbacks(response.data);
    };
    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      feedback.orderCode.toLowerCase().includes(searchLower) ||
      feedback.customerName.toLowerCase().includes(searchLower) ||
      feedback.clothes.name.toLowerCase().includes(searchLower) ||
      feedback.feedbackMessage.toLowerCase().includes(searchLower);

    const matchesRating = filterRating === 'all' || feedback.rating === filterRating;

    return matchesSearch && matchesRating;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, textAlign: 'left' }}>
        Đánh giá từ khách hàng
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo tên, mã đơn, nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as number | 'all')}
            displayEmpty
          >
            <MenuItem value="all">Tất cả sao</MenuItem>
            {[5, 4, 3, 2, 1].map((rating) => (
              <MenuItem key={rating} value={rating}>
                {rating} sao
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((feedback) => (
            <Grid item xs={12} key={feedback.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <img
                      src={feedback.clothes.image}
                      alt={feedback.clothes.name}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 6
                      }}
                    />
                    <Box>
                      <Typography variant="h6">
                        {feedback.clothes.name}
                      </Typography>
                      <Typography  gutterBottom>
                        <b>Mã đơn:</b> {feedback.orderCode}
                      </Typography>
                      <Typography>
                        <b>Khách hàng:</b> {feedback.customerName}
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">
                        <b>SĐT:</b> {feedback.customerPhone || 'Chưa cập nhật'}
                      </Typography> */}
                      <Rating value={feedback.rating} readOnly />
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Lời nhắn:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {feedback.feedbackMessage}
                  </Typography>

                  {feedback.feedbackImages?.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Ảnh feedback:
                      </Typography>
                      <ImageList cols={4} gap={8} sx={{ maxHeight: 600, overflow: 'auto' }}>
                        {feedback.feedbackImages.map((img, idx) => (
                          <ImageListItem key={idx}>
                            <img
                              src={img}
                              alt={`feedback-${idx}`}
                              style={{ 
                                borderRadius: 4,
                                width: '50%',
                                height: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </>
                  )}

                  <Typography color="textSecondary" sx={{ mt: 2 }}>
                    {new Date(feedback.feedbackAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  Không tìm thấy đánh giá nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thử tìm kiếm với từ khóa khác
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Feedbacks;