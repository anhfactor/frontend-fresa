import React, { useState } from 'react';
import {
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Select,
  Spin,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import shopService from '../../../services/shop';
import { setOrderData } from '../../../redux/slices/order';
import useDidUpdate from '../../../helpers/useDidUpdate';
import moment from 'moment';

const DeliveryInfo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.order, shallowEqual);
  const [loading, setLoading] = useState(false);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  function getShopDeliveries(shop) {
    setLoading(true);
    const params = {
      'shops[0]': shop,
    };
    shopService
      .getShopDeliveries(params)
      .then((res) => {
        dispatch(setOrderData({ deliveries: res.data[0].deliveries }));
      })
      .finally(() => setLoading(false));
  }

  useDidUpdate(() => {
    if (data.shop) {
      getShopDeliveries(data.shop.value);
    }
  }, [data.shop]);

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
    if (!list?.length) return [];
    return list.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  const setDeliveryPrice = (delivery) => {
    const item = shop.deliveries.find((el) => el.id === delivery.value);
    dispatch(setOrderData({ delivery_fee: item.price }));
  };

  return (
    <Card title={t('shipping.info')}>
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
              options={formatDeliveries(shop.deliveries)}
              labelInValue
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
                <Select options={getHours(shop)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('delivery.fee')} name='delivery_fee' hidden>
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default DeliveryInfo;
