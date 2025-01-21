import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        const orderCode = `PA${searchParams.get('orderCode')}`;
        const status = searchParams.get('status');
        const code = searchParams.get('code');
        
        console.log('=== PAYMENT SUCCESS PARAMS ===', {
          orderCode,
          status,
          code
        });

        if ((status === 'PAID' || code === '00') && orderCode) {
          try {
            await axiosInstance.post(`/rentals/updatePayment/${orderCode}`, {
              status: 'approved'
            });
          } catch (error) {
            console.error('Error updating payment status:', error);
          }

          navigate(`/rental-success?orderCode=${orderCode}`);
        } else {
          console.log('Invalid status or orderCode:', { status, code, orderCode });
          navigate('/');
        }
      } catch (error) {
        console.error('=== PAYMENT SUCCESS ERROR ===', error);
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