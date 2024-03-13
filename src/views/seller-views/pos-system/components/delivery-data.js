import { Col, DatePicker, Form, Row, Select } from 'antd';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch } from 'react-redux';
import { setCartData } from '../../../../redux/slices/cart';
import { useSelector } from 'react-redux';
import { getCartData } from 'redux/selectors/cartSelector';
import { weeks } from './week';

const DeliveryData = ({ setDeliveryPrice }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => getCartData(state.cart));
  const date = new Date(data?.delivery_date);
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const shopTime = shop?.shop_working_days
    ?.filter((item) => item.disabled === false)
    ?.find((item) => item?.day === weeks[date?.getDay()]?.title);

  const filter = shop?.shop_closed_date?.map((date) => date.day);

  function disabledDate(current) {
    const a = filter?.find(
      (date) => date === moment(current).format('YYYY-MM-DD')
    );
    const b = moment().add(-1, 'days') >= current;
    if (a) {
      return a;
    } else {
      return b;
    }
  }

  const range = (start, end) => {
    const x = parseInt(start);
    const y = parseInt(end);
    const number = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ];
    for (let i = x; i <= y; i++) {
      delete number[i];
    }
    return number;
  };

  const middle = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const disabledDateTime = () => ({
    disabledHours: () =>
      range(
        moment(new Date()).format('DD') ===
          moment(data?.delivery_date).format('DD')
          ? shopTime?.from.substring(0, 2) >= moment(new Date()).format('HH')
            ? shopTime?.from.substring(0, 2)
            : moment(new Date()).format('HH')
          : shopTime?.from.substring(0, 2),
        shopTime?.to.substring(0, 2)
      ),
    disabledMinutes: () => middle(0, 60),
    disabledSeconds: () => middle(0, 60),
  });

  function formatDeliveries(list) {
    if (!list?.length) return [];
    return list.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  console.log('shop', shop);
  return (
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
                format='YYYY-MM-DD'
                disabledDate={disabledDate}
                onChange={(e) => {
                  const delivery_date = moment(e).format('YYYY-MM-DD');
                  dispatch(
                    setCartData({
                      delivery_date,
                      bag_id: currentBag,
                    })
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={`${t('delivery.time')} (${t('up.to')})`}
              name='delivery_time'
              rules={[
                {
                  required: false,
                  message: t('required'),
                },
              ]}
            >
              <DatePicker
                disabled={!data.delivery_date}
                picker='time'
                placeholder={t('start.time')}
                className='w-100'
                format={'HH:mm:ss'}
                showNow={false}
                disabledTime={disabledDateTime}
                onChange={(e) => {
                  const delivery_time = moment(e).format('HH:mm:ss');
                  dispatch(setCartData({ delivery_time, bag_id: currentBag }));
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default DeliveryData;
