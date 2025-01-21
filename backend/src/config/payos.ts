import dotenv from 'dotenv';
dotenv.config();

import PayOS = require('@payos/node');

if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
  throw new Error('Missing PayOS configuration');
}

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// Kiểm tra xem PayOS đã được khởi tạo đúng chưa
console.log('PayOS config:', {
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

export const payosConfig = {
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  // baseUrl: process.env.PAYOS_BASE_URL || 'https://api-sandbox.payos.vn/v1'
};

export default payos; 