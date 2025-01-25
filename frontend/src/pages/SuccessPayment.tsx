import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const updatePayment = async () => {
      try {
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');

        if (orderCode && status === 'PAID') {
          // Thêm prefix PA vào orderCode
          const fullOrderCode = `PA${orderCode}`;
          
          await axiosInstance.post(`/rentals/updatePayment/${fullOrderCode}`, {
            status: 'approved'  // Đổi 'PAID' thành 'approved' để khớp với backend
          });

          // Chuyển hướng về trang rental-success thay vì /error
          navigate(`/rental-success?orderCode=${fullOrderCode}`);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error updating payment:', error);
        navigate('/');  // Chuyển về trang chủ thay vì /error
      }
    };

    updatePayment();
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Đang xử lý thanh toán...</h2>
      <p>Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default SuccessPayment; 