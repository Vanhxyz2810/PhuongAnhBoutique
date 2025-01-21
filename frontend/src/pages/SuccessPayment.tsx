import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');
        
        if (status === 'PAID') {
          // Gọi API để cập nhật trạng thái đơn hàng
          await axiosInstance.post(`/rentals/update-payment/${orderCode}`, {
            status: 'PAID'
          });
          
          // Redirect to rental success page
          navigate(`/rental-success?orderCode=${orderCode}`);
        }
      } catch (error) {
        console.error('Error handling payment success:', error);
        navigate('/');
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate]);

  return (
    <div>Đang xử lý thanh toán...</div>
  );
};

export default SuccessPayment; 