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
import { Bar } from 'react-chartjs-2';
import axiosInstance from '../utils/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  Scale,
  TooltipItem,
  CoreScaleOptions,
} from 'chart.js';
import { startOfWeek, startOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';

// import { styled as muiStyled } from '@mui/material/styles';

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

interface Clothes {
  id: string;
  name: string;
  ownerName: string;
  rentalPrice: number;
  description: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClothesStats {
  name: string;
  count: number;
  revenue: number;
}

interface Rental {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: string;
  clothes: Clothes;
  rentDate: string;
  returnDate: string;
}

const CardContent = styled.div`
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  text-align: center;
`;

// Cập nhật AnimatedCard
const AnimatedCard = styled(Paper)`
  border-radius: 24px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

// Thêm filter blur cho border
const StyledContainer = styled(Container)`
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
`;

const Revenue = () => {
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    daily: 0,
    weekly: 0,
    monthly: 0
  });
  const [chartView, setChartView] = useState<'week' | 'month'>('week');
  const [topClothes, setTopClothes] = useState<Array<ClothesStats & { id: string }>>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>(Array(7).fill(0));
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(31).fill(0));

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
      if (rental.status !== 'approved') return;
      
      const rentalDate = new Date(rental.rentDate);
      console.log('Processing rental:', {
        date: rentalDate,
        amount: rental.totalAmount,
        isToday: rentalDate >= startOfDay,
        isThisWeek: rentalDate >= startOfWeekDate,
        isThisMonth: rentalDate >= startOfMonthDate
      });

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

    console.log('Final stats:', stats);
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
      if (rental.status !== 'approved') return;
      
      if (rental.clothes && clothesStats[rental.clothes.id]) {
        clothesStats[rental.clothes.id].count += 1;
        clothesStats[rental.clothes.id].revenue += rental.totalAmount;
      }
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

  const calculateChartData = (rentalsData: Rental[]) => {
    const now = new Date();
    const startOfWeekDate = startOfWeek(now, { locale: vi });
    const startOfMonthDate = startOfMonth(now);
    
    const weekData = Array(7).fill(0);
    const monthData = Array(31).fill(0);

    rentalsData.forEach(rental => {
      if (rental.status !== 'approved') return;
      
      const rentalDate = new Date(rental.rentDate);
      
      if (rentalDate >= startOfWeekDate) {
        const dayOfWeek = rentalDate.getDay();
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekData[index] += rental.totalAmount;
      }

      if (rentalDate >= startOfMonthDate) {
        const dayOfMonth = rentalDate.getDate() - 1;
        monthData[dayOfMonth] += rental.totalAmount;
      }
    });

    console.log('Chart data:', { weekData, monthData });
    setWeeklyData(weekData);
    setMonthlyData(monthData);
  };

  const fetchData = useCallback(async () => {
    try {
      // Log để kiểm tra request
      console.log('Fetching data...');

      const [rentalsRes, clothesRes] = await Promise.all([
        axiosInstance.get<Rental[]>('/rentals'),
        axiosInstance.get<Clothes[]>('/clothes')
      ]);

      // Log response để kiểm tra data
      console.log('Rentals data:', rentalsRes.data);
      console.log('Clothes data:', clothesRes.data);

      const rentalsData = rentalsRes.data;
      
      // Kiểm tra cấu trúc của rental data
      rentalsData.forEach(rental => {
        console.log('Rental:', {
          id: rental.id,
          orderCode: rental.orderCode,
          customerName: rental.customerName,
          phone: rental.phone,
          totalAmount: rental.totalAmount,
          status: rental.status,
          rentDate: rental.rentDate,
          returnDate: rental.returnDate
        });
      });

      calculateRevenue(rentalsData);
      calculateTopClothes(rentalsData, clothesRes.data);
      calculateChartData(rentalsData);
    } catch (error) {
      // Log chi tiết lỗi
      console.error('Lỗi khi lấy dữ liệu:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const barChartData = {
    labels: chartView === 'week' 
      ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
      : Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    datasets: [{
      label: 'Doanh Thu',
      data: chartView === 'week' ? weeklyData : monthlyData,
      backgroundColor: '#FFB5D8'
    }]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(
            this: Scale<CoreScaleOptions>, 
            tickValue: number | string
          ) {
            const value = Number(tickValue);
            if (value >= 1000000) {
              return (value / 1000000).toLocaleString('vi-VN') + 'M';
            }
            return value.toLocaleString('vi-VN') + 'đ';
          },
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          },
          maxRotation: chartView === 'month' ? 90 : 0, // Xoay label khi xem theo tháng
          minRotation: chartView === 'month' ? 90 : 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'bar'>) {
            const value = Number(tooltipItem.formattedValue);
            return value.toLocaleString('vi-VN') + 'đ';
          }
        }
      }
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <Typography 
        variant="h4" 
          sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: 'primary.main',
            textAlign: 'center'
          }}
      >
        Thống Kê Doanh Thu
      </Typography>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  color: '#666',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.4rem' }
                }}
              >
                Doanh Thu Hôm Nay
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FF1493', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: { xs: '1.9rem', sm: '2rem' }
                }}
              >
                {revenueStats.daily.toLocaleString()}đ
              </Typography>
            </CardContent>
          </AnimatedCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  color: '#666',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.4rem' }
                }}
              >
                Doanh Thu Tuần Này
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#9370DB', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: { xs: '1.9rem', sm: '2rem' }
                }}
              >
                {revenueStats.weekly.toLocaleString()}đ
              </Typography>
            </CardContent>
          </AnimatedCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  color: '#666',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.4rem' }
                }}
              >
                Doanh Thu Tháng Này
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#20B2AA', 
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {revenueStats.monthly.toLocaleString()}đ
              </Typography>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            height: 'auto',
            width: '100%',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 },
              mb: 2,
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                Biểu Đồ Doanh Thu
              </Typography>
              <ToggleButtonGroup
                value={chartView}
                exclusive
                onChange={(_, value) => value && setChartView(value)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: { xs: 1, sm: 2 },
                    py: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              >
                <ToggleButton value="week">TUẦN</ToggleButton>
                <ToggleButton value="month">THÁNG</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ 
              width: '100%',
              height: { xs: 300, sm: 400 },
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '100%'
            }}>
              <Bar 
                data={barChartData} 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer 
        component={Paper}
        sx={{ 
          mt: { xs: 2, sm: 3 },
          overflowX: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Quần Áoo</TableCell>
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
    </StyledContainer>
  );
};

export default Revenue; 