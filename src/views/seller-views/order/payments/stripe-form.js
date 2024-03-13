import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import React, { useState } from 'react';
import { Button, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import transactionService from '../../../../services/transaction';
import Loading from '../../../../components/loading';
import { shallowEqual, useSelector } from 'react-redux';

export default function StripeForm({ handleCancel, handleSave }) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const {data}  = useSelector((state) => state.order, shallowEqual);
  const {orderData}  = useSelector((state) => state.order, shallowEqual);

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res.data.id))
      .finally(() => setLoading(false));
  }

  const onFinish = async () => {
    const payment = {
      payment_sys_id: data.paymentType.value,
    };
    if (!stripe || !elements) {
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/payment-result",
      },
      redirect: 'if_required',
    });
    if (result.paymentIntent?.status === 'succeeded') {
      createTransaction(orderData.id, payment);
    } else if (result.error) {
      toast.error(result.error.message);
    } else {
      console.log(result.error.message);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Form layout={'vertical'} name='stripe' form={form}>
          <Form.Item
            name='stripe'
            label={t('stripe')}
            rules={[{ required: true, message: t('required') }]}
          >
            <PaymentElement />
          </Form.Item>
          <div className='d-flex justify-content-end mt-5'>
            <Button
              type='primary'
              htmlType='submit'
              className='mr-3'
              onClick={onFinish}
              disabled={!stripe}
            >
              {t('submit')}
            </Button>
            <Button onClick={handleCancel}>{t("cancel")}</Button>
          </div>
        </Form>
      )}
    </>
  );
}
