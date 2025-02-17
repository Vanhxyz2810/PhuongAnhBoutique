import { useEffect } from 'react';

const MessengerChat = () => {
  useEffect(() => {
    // Khởi tạo lại plugin khi component mount
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return null; // Component này không render gì cả
};

export default MessengerChat; 