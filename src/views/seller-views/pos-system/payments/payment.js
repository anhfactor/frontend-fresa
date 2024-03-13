import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeForm from './stripe-form';
import { shallowEqual, useSelector } from 'react-redux';
import PayPal from './paypal-form';
import PaystackForm from './paystack-form';
import RazorpayForm from './razorpay-form';
import { STRIPE_PUBLISHABLE_KEY } from '../../../../configs/app-global';
import { getCartData } from '../../../../redux/selectors/cartSelector';

const Payment = ({ visibility, handleCancel, handleSave }) => {
  const { cartPayment } = useSelector((state) => state.cart, shallowEqual);
  const type = useSelector((state) => getCartData(state.cart));
  const { t } = useTranslation();
  const PUBLIC_STRIPE = STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(PUBLIC_STRIPE);
  const options = {
    clientSecret: visibility.stripe?.paymentIntent?.client_secret,
  };

  return (
    <Modal
      visible={visibility}
      title={t('create.payment')}
      className='large-modal'
      footer={false}
      onCancel={handleCancel}
    >
      {type.paymentType.label === 'Paypal' && visibility.paypal && (
        <PayPal handleSave={handleSave} client_key={cartPayment} />
      )}
      {type.paymentType.label === 'Paystack' && visibility.paystack && (
        <PaystackForm
          handleSave={handleSave}
          handleCancel={handleCancel}
          client_key={cartPayment}
        />
      )}
      {type.paymentType.label === 'Razorpay' && visibility.razorpay && (
        <RazorpayForm handleSave={handleSave} client_key={cartPayment} />
      )}
      {type.paymentType.label === 'Stripe' && visibility.stripe && (
        <Elements stripe={stripePromise} options={options}>
          <StripeForm handleCancel={handleCancel} handleSave={handleSave} />
        </Elements>
      )}
    </Modal>
  );
};

export default Payment;
