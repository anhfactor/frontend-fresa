import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { shallowEqual, useSelector } from 'react-redux';
import transactionService from '../../../../services/transaction';
import { PAYPAL_KEY } from '../../../../configs/app-global';

function PayPal({ handleSave, client_key }) {
  const { data } = useSelector((state) => state.order, shallowEqual);
  const { orderData } = useSelector((state) => state.order, shallowEqual);

  function createTransaction(id, data) {
    transactionService.create(id, data).then((res) => handleSave(res.data.id));
  }

  const payment = {
    payment_sys_id: data.paymentType.value,
  };

  if (!orderData?.price) return '';
  return (
    <PayPalScriptProvider
      options={{
        'client-id': client_key.client_id || PAYPAL_KEY,
        currency: 'USD',
      }}
    >
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: `${orderData?.price}`,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(() => {
            createTransaction(orderData.id, payment);
          });
        }}
      />
    </PayPalScriptProvider>
  );
}

export default PayPal;
