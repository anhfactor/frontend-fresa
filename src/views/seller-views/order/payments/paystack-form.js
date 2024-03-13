import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaystackConsumer } from 'react-paystack';
import { shallowEqual, useSelector } from 'react-redux';
import transactionService from '../../../../services/transaction';
import { Button } from 'antd';
import { PAYSTACK_KEY } from '../../../../configs/app-global';

function PaystackForm({ handleSave, handleClose, client_key }) {
  const { t } = useTranslation();
  const { data } = useSelector((state) => state.order, shallowEqual);
  const { orderData } = useSelector((state) => state.order, shallowEqual);

  function createTransaction(id, data) {
    transactionService.create(id, data).then((res) => handleSave(res.data.id));
  }

  const sys_id = {
    payment_sys_id: data.paymentType.value,
  };

  const handleSuccess = () => createTransaction(orderData.id, sys_id);

  const config = {
    reference: new Date().getTime().toString(),
    email: data.userOBJ.email,
    amount: parseFloat(orderData?.price) * 100,
    publicKey: client_key?.client_id || PAYSTACK_KEY,
    currency: 'ZAR',
    order_id: orderData?.id,
  };
  const componentProps = {
    ...config,
    text: 'Paystack Button Implementation',
    onSuccess: (reference) => handleSuccess(reference),
    onClose: handleClose,
  };

  return (
    <>
      {Object.keys(orderData).length !== 0 && (
        <PaystackConsumer {...componentProps}>
          {({ initializePayment }) => (
            <>
              <p>
                {t('total.amount')}
                {': '}
                {orderData.price}
              </p>
              <Button
                className='d-flex justify-content-end'
                onClick={() => initializePayment(handleSuccess, handleClose)}
              >
                {t('paystack')}
              </Button>
            </>
          )}
        </PaystackConsumer>
      )}
    </>
  );
}

export default PaystackForm;
