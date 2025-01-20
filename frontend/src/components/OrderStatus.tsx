import { Chip } from '@mui/material';

type OrderStatusProps = {
  status: string;
};

const OrderStatus = ({ status }: OrderStatusProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Đang duyệt',
          color: 'warning' as const,
          description: 'Đơn hàng đang chờ xác nhận'
        };
      case 'approved':
        return {
          label: 'Đã xác nhận',
          color: 'info' as const,
          description: 'Đơn hàng đã được xác nhận, đang cho thuê'
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'success' as const,
          description: 'Khách hàng đã trả đồ, đơn hàng hoàn tất'
        };
      case 'rejected':
        return {
          label: 'Đã từ chối',
          color: 'error' as const,
          description: 'Đơn hàng bị từ chối'
        };
      default:
        return {
          label: 'Không xác định',
          color: 'default' as const,
          description: ''
        };
    }
  };

  const { label, color } = getStatusConfig(status);

  return (
    <Chip 
      label={label} 
      color={color} 
      size="small"
      sx={{ 
        fontWeight: 'medium',
        minWidth: 100
      }} 
    />
  );
};

export default OrderStatus; 