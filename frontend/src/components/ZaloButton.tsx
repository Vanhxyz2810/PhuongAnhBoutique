import { IconButton, Tooltip } from '@mui/material';

import ZaloIcon from '/images/icon-zalo.png'; // hoặc dùng custom icon

import { theme } from '../theme';

const ZaloButton = () => {
  const handleClick = () => {   
    window.open('https://zalo.me/0704142927', '_blank');
  };

  return (
    <Tooltip title="Nhắn tin với tôi qua Zalo">
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 20,
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
          src={ZaloIcon}
          alt="Zalo"
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

export default ZaloButton; 