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
      case 'pending_payment':
        return {
          label: 'Chờ thanh toán',
          color: 'info' as const,
          description: 'Đơn hàng đang chờ thanh toán'
        };
      case 'approved':
        return {
          label: 'Đã xác nhận',
          color: 'success' as const,
          description: 'Đơn hàng đã được xác nhận'
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'success' as const,
          description: 'Đơn hàng đã hoàn thành'
        };
      case 'rejected':
        return {
          label: 'Từ chối',
          color: 'error' as const,
          description: 'Đơn hàng đã bị từ chối'
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'error' as const,
          description: 'Đơn hàng đã bị hủy'
        };
      default:
        return {
          label: 'Chờ xác nhận',
          color: 'default' as const,
          description: 'Đang chờ xác nhận'
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
        minWidth: 100,
        '& .MuiChip-label': {
          px: 2
        }
      }} 
    />
  );
};

export default OrderStatus; 