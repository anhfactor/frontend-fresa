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
import shopService from '../../services/shop';
import useDidUpdate from '../../helpers/useDidUpdate';
import { setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

export default function DeliveryInfoAdmin({ form }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: orderData } = useSelector((state) => state.order, shallowEqual);
  const activeMenu = useSelector(
    (state) => state.menu.activeMenu,
    shallowEqual
  );
  const { data } = activeMenu;
  const [loading, setLoading] = useState(false);

  function getOrderDeliveries(shops, deliveries) {
    return shops.map((item, idx) => ({
      shop_id: item.id,
      delivery: deliveries[idx]?.delivery,
      delivery_date: moment(deliveries[idx]?.delivery_date),
      delivery_time: deliveries[idx]?.delivery_time,
      delivery_fee: deliveries[idx]?.delivery_fee,
    }));
  }

  function getShopDeliveries(shop) {
    setLoading(true);
    const params = {
      'shops[0]': shop,
    };
    shopService
      .getShopDeliveries(params)
      .then((res) => dispatch(setMenuData({ activeMenu, data: res.data })))
      .finally(() => setLoading(false));
  }
  console.log(orderData.shop);
  useDidUpdate(() => {
    if (orderData) {
      getShopDeliveries(orderData.shop?.value);
      // if (orderData.deliveries.length) {
      //     form.setFieldsValue({
      //         deliveries: getOrderDeliveries(orderData, orderData.deliveries),
      //     });
      //     return;
      // }
      // form.setFieldsValue({
      //     deliveries: orderData?.map((item) => ({
      //         shop_id: item.id,
      //         delivery: '',
      //         delivery_date: '',
      //         delivery_time: '',
      //         delivery_fee: '',
      //     })),
      // });
    } else {
      form.setFieldsValue({
        deliveries: '',
      });
    }
  }, [orderData]);

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

  console.log('data', data);

  return (
    <Card title={t('shipping.info')}>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div>
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name={'delivery'}
              label={t('delivery')}
              rules={[{ required: true, message: t('required.field') }]}
            >
              <Select
                placeholder={t('select.delivery')}
                options={formatDeliveries(data)}
                labelInValue
              />
            </Form.Item>
          </Col>

          {/* <Col span={24}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name={'delivery_date'}
                  label={t('delivery.date')}
                  rules={[
                    {
                      required: true,
                      message: t('required.field'),
                    },
                  ]}
                >
                  <DatePicker className='w-100' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={`${t('delivery.time')} (${t('up.to')})`}
                  name={'delivery_time'}
                  rules={[
                    {
                      required: true,
                      message: t('required.field'),
                    },
                  ]}
                >
                  <Select options={getHours(data?.shop)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('delivery.fee')}
                  name={'delivery_fee'}
                  hidden
                >
                  <InputNumber className='w-100' />
                </Form.Item>
              </Col>
            </Row>
          </Col> */}
        </Row>
      </div>
    </Card>
  );
}
