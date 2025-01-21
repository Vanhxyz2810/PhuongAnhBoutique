import { useEffect, useState } from 'react';
import { usePayOS } from '@payos/payos-checkout';

interface PaymentEmbedProps {
  paymentUrl: string;
  onSuccess: () => void;
}

const PaymentEmbed = ({ paymentUrl, onSuccess }: PaymentEmbedProps) => {
  const [config] = useState({
    RETURN_URL: window.location.origin,
    ELEMENT_ID: 'embedded-payment-container',
    CHECKOUT_URL: paymentUrl,
    embedded: true,
    onSuccess: onSuccess
  });

  const { open } = usePayOS(config);

  useEffect(() => {
    if (config.CHECKOUT_URL) {
      open();
    }
  }, [config.CHECKOUT_URL, open]);

  return (
    <div
      id="embedded-payment-container"
      style={{ height: '350px' }}
    />
  );
};

export default PaymentEmbed; 