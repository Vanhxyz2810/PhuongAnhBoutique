import { IconButton, Tooltip } from '@mui/material';
import MessengerIcon from '/images/icon-mess.png'; // hoặc dùng custom icon
import { theme } from '../theme';

const MessengerButton = () => {
  const handleClick = () => {   
    window.open('https://m.me/272041975993565', '_blank');
  };

  return (
    <Tooltip title="Nhắn tin với tôi qua Messenger">
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },
          width: 60,
          height: 60,
          padding: 0,
          zIndex: 1000,
        }}
      >
        <img 
          src={MessengerIcon}
          alt="Messenger"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

export default MessengerButton; 