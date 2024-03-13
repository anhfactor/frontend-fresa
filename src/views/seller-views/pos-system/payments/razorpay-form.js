import axios from 'axios';
import React, { useCallback } from 'react';
import useRazorpay from 'react-razorpay';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import transactionService from '../../../../services/transaction';
import { Button } from 'antd';
import {
  RAZORPAY_KEY,
  RazorpayApi,
} from '../../../../configs/app-global';
import { getCartData } from '../../../../redux/selectors/cartSelector';

const RazorpayForm = ({ handleSave, client_key }) => {
  const { t } = useTranslation();
  const data = useSelector((state) => getCartData(state.cart));
  const { cartOrder } = useSelector((state) => state.cart, shallowEqual);
  const Razorpay = useRazorpay();

  function createTransaction(id, data) {
    transactionService.create(id, data).then((res) => handleSave(res.data.id));
  }

  const sys_id = {
    payment_sys_id: data.paymentType.value,
  };

  const handlePayment = useCallback(async () => {
    const { data: res } = await axios.post(RazorpayApi, {
      amount: cartOrder?.price,
    });

    const options = {
      key: client_key?.client_id || RAZORPAY_KEY,
      amount: cartOrder?.price,
      currency: 'INR',
      name: `${data.userOBJ?.firstname} ${data.userOBJ?.lastname}`,
      description: 'Transaction',
      image: 'https://example.com/your_logo',
      order_id: res.order.id,
      handler: (res) => createTransaction(cartOrder.id, sys_id),
      prefill: {
        name: `${data.userOBJ?.firstname} ${data.userOBJ?.lastname}`,
        email: data.userOBJ?.email,
        contact: data.userOBJ?.phone,
      },
      notes: {
        address: data.address?.label,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzpay = new Razorpay(options);
    rzpay.open();
  });
  return (
    <>
      <p>
        {t('total.amount')}
        {': '}
        {cartOrder.price}
      </p>
      <Button className='btn btn-dark' onClick={handlePayment}>
        {t('razorpay')}
      </Button>
    </>
  );
};

export default RazorpayForm;
