import React, { useEffect, useState } from 'react';
import { Form, PageHeader, Row, Col, Button } from 'antd';
import '../../../assets/scss/page/order-add.scss';
import UserInfo from './user-info';
import DeliveryInfo from './delivery-info';
import ProductInfo from './product-info';
import PreviewInfo from './preview-info';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from '../../../services/seller/order';
import moment from 'moment';
import {
  clearOrder,
  setOrder,
  setOrderCurrency,
  setOrderData,
  setPayment,
} from '../../../redux/slices/order';
import { useNavigate } from 'react-router-dom';
import { disableRefetch, removeFromMenu } from '../../../redux/slices/menu';
import { fetchSellerOrders } from '../../../redux/slices/orders';
import transactionService from '../../../services/transaction';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Payment from '../../seller-views/order/payments/payment';
import paymentService from '../../../services/seller/payment';
import { StripeApi } from '../../../configs/app-global';

export default function SellerOrderAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentModal, setPaymentModal] = useState(null);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { orderProducts, data, total, coupon } = useSelector(
    (state) => state.order,
    shallowEqual
  );

  const { delivery } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currencies } = useSelector((state) => state.currency, shallowEqual);

  useEffect(() => {
    return () => {
      const formData = form.getFieldsValue(true);
      console.log('formData => ', formData);
      const data = {
        ...formData,
        delivery_date: formData.delivery_date
          ? moment(formData.delivery_date).format('YYYY-MM-DD')
          : undefined,
      };
      dispatch(setOrderData(data));
    };
  }, []);

  useEffect(() => {
    if (activeMenu.refetch) {
      const currency = currencies.find((item) => item.default);
      dispatch(setOrderCurrency(currency));
      form.setFieldsValue({
        currency_id: currency.id,
      });
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        setOrderId(res.data.id);
        dispatch(clearOrder());
      })
      .finally(() => setLoading(false));
  }

  const stripePay = (createdOrderData) => {
    if (
      data.paymentType.label === 'Stripe' &&
      Object.keys(createdOrderData)?.length
    ) {
      axios
        .post(StripeApi, {
          amount: createdOrderData.price,
          order_id: createdOrderData.id,
        })
        .then((res) => {
          setPaymentModal({ stripe: res.data });
        })
        .catch((error) => console.log(error));
    }
  };

  const orderCreate = (body, paymentData) => {
    const payment = {
      payment_sys_id: paymentData.value,
    };
    setLoading(true);
    orderService
      .create(body)
      .then((response) => {
        dispatch(setOrder(response.data));
        if (paymentData.label === 'Stripe') {
          stripePay(response.data);
        } else if (paymentData.label === 'Paypal') {
          setPaymentModal({ paypal: response.data });
        } else if (paymentData.label === 'Paystack') {
          setPaymentModal({ paystack: response.data });
        } else if (paymentData.label === 'Razorpay') {
          setPaymentModal({ razorpay: response.data });
        } else {
          createTransaction(response.data.id, payment);
        }
      })
      .catch(() => setLoading(false));
  };

  const onFinish = (values) => {
    console.log('values => ', values);
    const totalPrice = data.delivery_fee + total.order_total;
    const body = {
      user_id: values.user?.value,
      total: totalPrice,
      currency_id: values.currency_id,
      rate: currencies.find((item) => item.id === values.currency_id)?.rate,
      shop_id: shop.id,
      delivery_id: values.delivery.value,
      delivery_fee: data.delivery_fee,
      coupon: coupon.coupon,
      tax: total.order_tax,
      commission_fee: 1,
      payment_type: values.payment_type.value,
      delivery_time: values.delivery_time,
      note: values.note,
      delivery_date: moment(values.delivery_date).format('YYYY-MM-DD'),
      delivery_address_id: values.address.value,
      delivery_type_id: values.delivery.value,
      total_discount: orderProducts.reduce(
        (total, item) => (total += item.discount),
        0
      ),
      products: orderProducts.map((product) => ({
        shop_product_id: product.id,
        price: product.price,
        qty: product.qty,
        tax: product.tax,
        discount: product.discount,
        total_price: product.total_price,
      })),
    };
    console.log('body => ', body);
    orderCreate(body, values.payment_type);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    const nextUrl = 'seller/orders';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    dispatch(fetchSellerOrders());
  };

  const handleSave = (id) => {
    setOrderId(id);
    setPaymentModal(null);
    dispatch(clearOrder());
  };

  const fetchPaypal = (value) => {
    const body = value.value;
    paymentService
      .getById(body, {})
      .then((res) => dispatch(setPayment(res.data)));
  };

  return (
    <>
      <PageHeader
        title={t('new.order')}
        extra={
          <Button
            type='primary'
            loading={loading}
            onClick={() => form.submit()}
            disabled={!orderProducts.length}
          >
            {t('create')}
          </Button>
        }
      />
      <Form
        name='order-form'
        form={form}
        layout='vertical'
        onFinish={onFinish}
        className='order-add'
        initialValues={{
          user: data.user || null,
          address: data.address || null,
          currency_id: data.currency.id,
          payment_type: data.payment_type || null,
          delivery_date: moment(data.delivery_date) || null,
          delivery: data.delivery || null,
          delivery_time: data.delivery_time || null,
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <ProductInfo form={form} />
          </Col>
          <Col span={8}>
            <UserInfo form={form} fetchPaypal={fetchPaypal} />
            <DeliveryInfo form={form} />
          </Col>
        </Row>

        {orderId ? (
          <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
        ) : (
          ''
        )}

        {paymentModal && (
          <Payment
            visibility={paymentModal}
            handleCancel={() => setPaymentModal(null)}
            handleSave={handleSave}
          />
        )}
      </Form>
    </>
  );
}
