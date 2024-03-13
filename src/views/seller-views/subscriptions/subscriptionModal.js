import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import subscriptionService from '../../../services/seller/subscriptions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchSellerPayments } from '../../../redux/slices/payment';
import Loading from '../../../components/loading';
import { toast } from 'react-toastify';
import { fetchMyShop } from '../../../redux/slices/myShop';
import Paystack from '../../../assets/images/paystack.svg';
import { FaPaypal, FaWallet, FaDollarSign } from 'react-icons/fa';
import { SiStripe, SiRazorpay } from 'react-icons/si';

const acceptedPayments = ['cash', 'wallet'];

export default function SellerSubscriptionModal({ modal, handleCancel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { payments, loading } = useSelector(
    (state) => state.payment,
    shallowEqual
  );
  const { seller } = useSelector((state) => state.myShop.myShop, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [paymentType, setPaymentType] = useState({});

  useEffect(() => {
    dispatch(fetchSellerPayments());
  }, []);

  const handleSubmit = () => {
    if (!paymentType.id) {
      toast.warning(t('please.select.payment.type'));
      return;
    }
    if (
      paymentType.payment.tag === 'wallet' &&
      seller?.wallet?.price < modal.price
    ) {
      toast.warning(t('insufficient.balance'));
      return;
    }
    setLoadingBtn(true);
    subscriptionService
      .attach(modal.id)
      .then(({ data }) => transactionCreate(data.id))
      .finally(() => setLoadingBtn(false));
  };

  function transactionCreate(id) {
    const payload = {
      payment_sys_id: paymentType.id,
    };
    subscriptionService
      .transactionCreate(id, payload)
      .then(() => {
        handleCancel();
        toast.success(t('successfully.purchased'));
        dispatch(fetchMyShop());
      })
      .finally(() => setLoadingBtn(false));
  }

  const selectPayment = (type) => {
    console.log('type', type.payment.tag);
    if (!acceptedPayments.includes(type.payment.tag)) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    setPaymentType(type);
  };

  const handleAddIcon = (data) => {
    switch (data) {
      case 'paypal':
        return <FaPaypal size={30} />;
      case 'stripe':
        return <SiStripe size={30} />;
      case 'cash':
        return <FaDollarSign size={30} />;
      case 'wallet':
        return <FaWallet size={30} />;
      case 'razorpay':
        return <SiRazorpay size={30} />;
      case 'paystack':
        return <img src={Paystack} alt='img' width='30' height='30' />;
    }
  };

  console.log('paymentType', paymentType);
  console.log('modal', modal);
  return (
    <Modal
      visible={!!modal}
      title={t('purchase.subscription')}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          onClick={handleSubmit}
          loading={loadingBtn}
          key='save-btn'
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel} key='cancel-btn'>
          {t('cancel')}
        </Button>,
      ]}
    >
      {!loading ? (
        <Row gutter={12}>
          {payments.map((item) => (
            <Col span={8}>
              <Card
                className={`payment-card ${
                  paymentType?.payment?.tag === item?.payment?.tag
                    ? 'active'
                    : ''
                }`}
                onClick={() => selectPayment(item)}
              >
                {handleAddIcon(item.payment?.tag)}
                <div className='font-weight-bold mt-2'>
                  {t(item.payment?.translation?.title)}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
