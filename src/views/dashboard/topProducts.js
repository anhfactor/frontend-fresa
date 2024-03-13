import React from 'react';
import { Card, Empty, Image, Select, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../helpers/getImage';
import {
  fetchSellerTopProducts,
  fetchTopProducts,
  filterTopProducts,
} from '../../redux/slices/statistics/topProducts';
import { useTranslation } from 'react-i18next';

export default function TopProducts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { topProducts, loading, params } = useSelector(
    (state) => state.topProducts,
    shallowEqual
  );
  const { role } = useSelector((state) => state.auth.user, shallowEqual);

  const handleChange = (value) => {
    const payload = { time: value };
    dispatch(filterTopProducts(payload));
    switch (role) {
      case 'admin':
        dispatch(fetchTopProducts(payload));
        break;
      case 'seller':
        dispatch(fetchSellerTopProducts(payload));
        break;

      default:
        break;
    }
  };

  return (
    <Card
      title={t('top.selled.products')}
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
      {topProducts.length ? (
        topProducts.map((item, idx) => (
          <div className='w-100 py-3 flex' key={idx}>
            <div className='d-flex avatar'>
              <Image
                src={getImage(item.product?.img)}
                width={40}
                height={40}
                preview={false}
              />
              <div className='ml-2 avatar-text'>
                <h5 className='title'>{item.product?.translation?.title}</h5>
                {/*<div className='text-muted'>*/}
                {/*  {item.product?.category?.translation?.title}*/}
                {/*</div>*/}
              </div>
            </div>
            <div className='d-flex'>
              <div className='mr-3 text-right'>
                <span className='text-muted'>{t('sales')}</span>
                <div className='mb-0 h5 font-weight-bold'>
                  {item.orders_count}
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
