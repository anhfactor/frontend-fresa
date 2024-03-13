import React from 'react';
import { Card, Empty, Image, Select, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import numberToPrice from '../../helpers/numberToPrice';
import {
  fetchTopCustomers,
  filterTopCustomers,
  fetchSellerTopCustomers,
} from '../../redux/slices/statistics/topCustomers';
import { useTranslation } from 'react-i18next';
import getAvatar from '../../helpers/getAvatar';

export default function TopCustomers() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { topCustomers, loading, params } = useSelector(
    (state) => state.topCustomers,
    shallowEqual
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const { role } = useSelector((state) => state.auth.user, shallowEqual);

  const handleChange = (value) => {
    const payload = { time: value };
    switch (role) {
      case 'admin':
        dispatch(filterTopCustomers(payload));
        dispatch(fetchTopCustomers(payload));
        break;
      case 'seller':
        dispatch(filterTopCustomers(payload));
        dispatch(fetchSellerTopCustomers(payload));
        break;

      default:
        break;
    }
  };

  return (
    <Card
      title={t('top.customers')}
      extra={
        <Select
          value={params.time}
          size='small'
          style={{ minWidth: 110 }}
          onSelect={handleChange}
        >
          <Select.Option value='subWeek'>{t('this.week')}</Select.Option>
          <Select.Option value='subMonth'>{t('this.month')}</Select.Option>
          <Select.Option value='subYear'>{t('this.year')}</Select.Option>
        </Select>
      }
    >
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      {topCustomers.length ? (
        topCustomers.map((item, idx) => (
          <div className='w-100 py-3 flex' key={idx}>
            <div className='d-flex avatar'>
              <Image
                src={getAvatar(item.img)}
                width={40}
                height={40}
                preview={false}
                className='rounded'
              />
              <div className='ml-2 avatar-text'>
                <h5 className='title'>
                  {item.firstname + ' ' + item.lastname}
                </h5>
                <div className='text-muted'>{item.phone}</div>
              </div>
            </div>
            <div className='d-flex'>
              <div className='mr-3 text-right'>
                <span className='text-muted'>{t('orders')}</span>
                <div className='mb-0 h5 font-weight-bold'>
                  {numberToPrice(item.orders_sum_price, defaultCurrency.symbol)}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <Empty />
      )}
    </Card>
  );
}
