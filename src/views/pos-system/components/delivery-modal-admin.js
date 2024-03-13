import React, { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Modal, Row, Select, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import shopService from '../../../services/shop';
import moment from 'moment';
import { setCartData } from '../../../redux/slices/cart';
import orderService from '../../../services/order';
import transactionService from '../../../services/transaction';
import { getCartData } from '../../../redux/selectors/cartSelector';

export default function DeliveryModalAdmin({
  visibility,
  handleCancel,
  handleSave,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state) => getCartData(state.cart));

  const { cartShops, total, coupons, currentBag, currency } = useSelector(
    (state) => state.cart,
    shallowEqual
  );

  const [delivery_fee, setDelivery_fee] = useState(null);
  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const [form] = Form.useForm();

  const orderCreate = (body) => {
    const payment = {
      payment_sys_id: data.paymentType.value,
    };
    setLoading(true);
    orderService
      .create(body)
      .then(({ data }) => createTransaction(data.id, payment))
      .catch(() => setLoading(false));
  };

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res.data.id))
      .finally(() => setLoading(false));
  }

  const onFinish = (values) => {
    console.log('values data => ', values);
    const body = {
      delivery_address_id: data.address.value,
      payment_type: data.paymentType.value,
      user_id: data.user?.value,
      shop_id: data.deliveries[0].id,
      delivery_date: moment(values?.delivery_date).format('YYYY-MM-DD'),
      delivery_time: values?.delivery_time,
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
    console.log('body => ', body);
    console.log('total => ', total);
    orderCreate(body);
  };

  useEffect(() => {
    if (cartShops.length) {
      form.setFieldsValue({
        deliveries: cartShops.map((item) => ({
          shop_id: item.id,
          delivery: '',
          delivery_date: '',
          delivery_time: '',
        })),
      });
    }
  }, [cartShops]);

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

  function getHours(shop) {
    const timeArray = [];
    let start = parseInt(shop?.open_time?.slice(0, 2));
    let end = parseInt(shop?.close_time?.slice(0, 2));
    for (start; start < end; start++) {
      timeArray.push({
        id: `${start}:00-${start + 1}:00`,
        value: `${start}:00 - ${start + 1}:00`,
      });
    }
    return timeArray;
  }

  function formatDeliveries(list) {
    return list.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  const setDeliveryPrice = (delivery) => {
    const item = data.deliveries[0]?.deliveries.find(
      (el) => el.id === delivery
    ).price;
    setDelivery_fee(item);
  };
  console.log(data);
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
      <Form form={form} layout='vertical' onFinish={onFinish}>
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name='delivery'
              label={t('delivery')}
              rules={[{ required: true, message: t('required') }]}
            >
              <Select
                placeholder={t('select.delivery')}
                options={formatDeliveries(data.deliveries)}
                onSelect={setDeliveryPrice}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name='delivery_date'
                  label={t('delivery.date')}
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <DatePicker
                    placeholder={t('delivery.date')}
                    className='w-100'
                    disabledDate={(current) =>
                      moment().add(-1, 'days') >= current
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={`${t('delivery.time')} (${t('up.to')})`}
                  name='delivery_time'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <Select options={getHours(data?.deliveries[0])} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
