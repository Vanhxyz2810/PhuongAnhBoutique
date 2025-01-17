import { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { startOfWeek, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface RevenueStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Rental {
  id: number;
  clothesIds: string[];
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
}

interface Clothes {
  id: string;
  name: string;
}

interface ClothesStats {
  name: string;
  count: number;
  revenue: number;
}

const Revenue = () => {
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    daily: 0,
    weekly: 0,
    monthly: 0
  });
  const [chartView, setChartView] = useState<'week' | 'month'>('week');
  const [topClothes, setTopClothes] = useState<Array<ClothesStats & { id: string }>>([]);

  const calculateRevenue = (rentalsData: Rental[]) => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeekDate = startOfWeek(now, { locale: vi });
    const startOfMonthDate = startOfMonth(now);

    const stats = {
      daily: 0,
      weekly: 0,
      monthly: 0
    };

    rentalsData.forEach(rental => {
      if (!rental.isPaid) return;
      
      const rentalDate = new Date(rental.createdAt);
      if (rentalDate >= startOfDay) {
        stats.daily += rental.totalAmount;
      }
      if (rentalDate >= startOfWeekDate) {
        stats.weekly += rental.totalAmount;
      }
      if (rentalDate >= startOfMonthDate) {
        stats.monthly += rental.totalAmount;
      }
    });

    setRevenueStats(stats);
  };

  const calculateTopClothes = (rentalsData: Rental[], clothesData: Clothes[]) => {
    const clothesStats = clothesData.reduce<Record<string, ClothesStats>>((acc, clothes) => {
      acc[clothes.id] = {
        name: clothes.name,
        count: 0,
        revenue: 0
      };
      return acc;
    }, {});

    rentalsData.forEach(rental => {
      if (!rental.isPaid) return;
      rental.clothesIds.forEach((id: string) => {
        if (clothesStats[id]) {
          clothesStats[id].count += 1;
          clothesStats[id].revenue += rental.totalAmount;
        }
      });
    });

    const sortedClothes = Object.entries(clothesStats)
      .map(([id, data]) => ({
        id,
        ...data
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopClothes(sortedClothes);
  };

  const fetchData = useCallback(async () => {
    try {
      const [rentalsRes, clothesRes] = await Promise.all([
        axios.get<Rental[]>('http://localhost:5001/api/rentals'),
        axios.get<Clothes[]>('http://localhost:5001/api/clothes')
      ]);

      const rentalsData = rentalsRes.data;
      calculateRevenue(rentalsData);
      calculateTopClothes(rentalsData, clothesRes.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const barChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{
      label: 'Doanh Thu',
      data: [2000000, 3000000, 2500000, 3500000, 3000000, 4500000, 4000000],
      backgroundColor: '#FFB5D8'
    }]
  };

  const pieChartData = {
    labels: ['Áo dài', 'Váy cưới', 'Vest', 'Đầm dạ hội'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#FFB5D8', '#B5D8FF', '#D8FFB5', '#FFD8B5']
    }]
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4, color: '#FF69B4', textAlign: 'left' }}>
        Thống Kê Doanh Thu
      </Typography>

      {/* Revenue Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#FFE4E1',
            borderRadius: 4,
            textAlign: 'left'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>
              Doanh Thu Hôm Nay
            </Typography>
            <Typography variant="h4" sx={{ color: '#FF1493', fontWeight: 'bold' }}>
              {revenueStats.daily.toLocaleString()}đ
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#E6E6FA',
            borderRadius: 4,
            textAlign: 'left'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>
              Doanh Thu Tuần Này
            </Typography>
            <Typography variant="h4" sx={{ color: '#9370DB', fontWeight: 'bold' }}>
              {revenueStats.weekly.toLocaleString()}đ
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            bgcolor: '#E0FFFF',
            borderRadius: 4,
            textAlign: 'left'
          }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#666' }}>
              Doanh Thu Tháng Này
            </Typography>
            <Typography variant="h4" sx={{ color: '#20B2AA', fontWeight: 'bold' }}>
              {revenueStats.monthly.toLocaleString()}đ
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Biểu Đồ Doanh Thu</Typography>
              <ToggleButtonGroup
                value={chartView}
                exclusive
                onChange={(_, value) => value && setChartView(value)}
                size="small"
              >
                <ToggleButton value="week">TUẦN</ToggleButton>
                <ToggleButton value="month">THÁNG</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tỷ Lệ Cho Thuê Theo Loại
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={pieChartData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Products Table */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Top Quần Áo Được Thuê Nhiều Nhất
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên Quần Áo</TableCell>
                <TableCell align="center">Số Lần Thuê</TableCell>
                <TableCell align="right">Doanh Thu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topClothes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="center">{item.count}</TableCell>
                  <TableCell align="right">
                    {item.revenue.toLocaleString()}đ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Revenue; 