import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import userService from '../../services/user';
import StatisticNumberWidget from './statisticNumberWidget';
import orderService from 'services/deliveryman/order';
import { nFormatter } from 'helpers/nFormatter';
import { shallowEqual, useSelector } from 'react-redux';

export default function DeliverymanDashboard() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  useEffect(() => {
    setLoading(true);

    userService
      .profileShow()
      .then(({ data }) => setUserData(data))
      .catch((error) => console.log(error));

    orderService
      .getStatistics()
      .then(({ data }) => setStatistics(data))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  const arrayList = [
    'accepted_orders_count',
    'cancel_orders_count',
    'delivered_orders_count',
    'new_orders_count',
    'on_a_way_orders_count',
    'ready_orders_count',
    'today_count',
    'total_delivered_price',
    'total_price',
  ];
  return (
    <Row gutter={24}>
      {arrayList?.map((key, id) => (
        <Col span={6} key={id}>
          {key.includes('price') ? (
            <StatisticNumberWidget
              title={t(key)}
              loading={loading}
              value={nFormatter(statistics?.[key], defaultCurrency?.symbol)}
            />
          ) : (
            <StatisticNumberWidget
              title={t(key)}
              value={statistics?.[key]}
              loading={loading}
            />
          )}
        </Col>
      ))}
      <Col span={18}>
        <StatisticNumberWidget
          title={t('balance')}
          value={nFormatter(userData?.wallet?.price, defaultCurrency?.symbol)}
          loading={loading}
        />
      </Col>
    </Row>
  );
}
