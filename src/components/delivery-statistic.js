import React from 'react';
import { Col, Row } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import StatisticNumberWidget from '../views/dashboard/statisticNumberWidget';
import { nFormatter } from '../helpers/nFormatter';

const DeliveryStatistic = ({ data: statistic, orders }) => {
  const { t } = useTranslation();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );

  const listArray = [
    'accepted_orders_count',
    'cancel_orders_count',
    'delivered_orders_count',
    'new_orders_count',
    'on_a_way_orders_count',
    'orders_count',
    'progress_orders_count',
    'ready_orders_count',
    'today_count',
    'total_delivered_price',
    'total_price',
  ];

  return (
    <Row gutter={16} className='mt-3'>
      {listArray?.map((key) => (
        <Col flex='0 0 16.6%'>
          {key.includes('price') ? (
            <StatisticNumberWidget
              title={t(key)}
              value={nFormatter(statistic?.[key], defaultCurrency?.symbol)}
            />
          ) : (
            <StatisticNumberWidget title={t(key)} value={statistic?.[key]} />
          )}
        </Col>
      ))}
    </Row>
  );
};

export default DeliveryStatistic;
