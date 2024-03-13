import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { shallowEqual, useSelector } from 'react-redux';
import transactionService from '../../../../services/transaction';
import { PAYPAL_KEY } from '../../../../configs/app-global';
import {getCartData} from "../../../../redux/selectors/cartSelector";

function PayPal({ handleSave, client_key }) {
  const data = useSelector((state) => getCartData(state.cart));
  const { cartOrder } = useSelector((state) => state.cart, shallowEqual);

  function createTransaction(id, data) {
    transactionService.create(id, data).then((res) => handleSave(res.data.id));
  }

  console.log("data", data)

  const payment = {
    payment_sys_id: data.paymentType.value,
  };

  if (!cartOrder?.price) return '';
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
                  value: `${cartOrder?.price}`,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(() => {
            createTransaction(cartOrder.id, payment);
          });
        }}
      />
    </PayPalScriptProvider>
  );
}

export default PayPal;
