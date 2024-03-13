import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import shopService from '../../../services/shop';
import moment from 'moment';
import { setCartData, setCartOrder } from '../../../redux/slices/cart';
import orderService from '../../../services/order';
import transactionService from '../../../services/transaction';
import { getCartData } from '../../../redux/selectors/cartSelector';
import DeliveryData from './delivery-data';

export default function DeliveryModal({
  visibility,
  handleCancel,
  handleSave,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { cartShops, total, coupons, currentBag, currency } = useSelector(
    (state) => state.cart,
    shallowEqual
  );

  const data = useSelector((state) => getCartData(state.cart));
  const [delivery_fee, setDelivery_fee] = useState(null);
  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const orderCreate = (body) => {
    const payment = {
      payment_sys_id: data.paymentType.value,
    };
    setLoading(true);
    orderService
      .create(body)
      .then((response) => {
        dispatch(setCartOrder(response.data));
        createTransaction(response.data.id, payment);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res.data.id))
      .finally(() => setLoading(false));
  }

  const onFinish = (values) => {
    const body = {
      delivery_address_id: data.address.value,
      payment_type: data.paymentType.value,
      user_id: data.user?.value,
      shop_id: data.shop?.value,
      delivery_date: data.delivery_date,
      delivery_time: moment(data.delivery_time, 'HH:mm').format('HH:mm'),
      delivery_fee: delivery_fee,
      currency_id: currency.id,
      coupon: coupons[0]?.coupon,
      delivery_type_id: values?.delivery,
      tax: total.order_tax,
      total: total.order_total + delivery_fee,
      rate: currencies.find((item) => item.id === currency.id)?.rate,
      products: cartShops[0].products?.map((product) => ({
        shop_product_id: product.id,
        price: product.price,
        qty: product.qty,
        tax: product.tax,
        discount: product.discount,
        total_price: product.total_price,
      })),
    };
    orderCreate(body);
  };

  useEffect(() => {
    if (data.deliveries.length) {
      form.setFieldsValue({
        deliveries: data.deliveries.map((item) => ({
          shop_id: item.id,
          delivery: '',
          delivery_date: '',
          delivery_time: '',
        })),
      });
    }
  }, [data.deliveries]);

  function getShopDeliveries(shops) {
    setLoading(true);
    const params = formatShopIds(shops);
    shopService
      .getShopDeliveries(params)
      .then((res) =>
        dispatch(setCartData({ deliveries: res.data, bag_id: currentBag }))
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (cartShops.length) {
      getShopDeliveries(cartShops);
    }
  }, [cartShops]);

  function formatShopIds(list) {
    const result = list.map((item, index) => ({
      [`shops[${index}]`]: item.id,
    }));
    return Object.assign({}, ...result);
  }

  const setDeliveryPrice = (delivery) => {
    const item = data.deliveries.find((el) => el.id === delivery).price;
    setDelivery_fee(item);
  };

  return (
    <Modal
      visible={visibility}
      title={t('shipping.info')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
      className='large-modal'
    >
      <Form
        onFinish={onFinish}
        layout={'vertical'}
        form={form}
        name='posSystem'
      >
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
        <DeliveryData setDeliveryPrice={setDeliveryPrice} />
      </Form>
    </Modal>
  );
}
