import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import ShopDelivery from './shopDelivery';
import Map from '../../components/shop/map';
import CreateShop from './create';
import UserEdit from './user';
import { setMenuData } from 'redux/slices/menu';
import { useQueryParams } from 'helpers/useQueryParams';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

const { Step } = Steps;

export const steps = [
  {
    title: 'shop',
    content: 'First-content',
  },
  {
    title: 'map',
    content: 'Second-content',
  },
  {
    title: 'delivery',
    content: 'Third-content',
  },
  {
    title: 'user',
    content: 'Four-content',
  },
];

const ShopsAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const queryParams = useQueryParams();
  const current = Number(queryParams.values?.step || 0);
  const dispatch = useDispatch();

  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };
  const prev = () => {
    const step = current - 1;
    queryParams.set('step', step);
  };

  const onChange = (step) => {
    dispatch(setMenuData({ activeMenu, data: { ...activeMenu.data, step } }));
    queryParams.set('step', step);
  };

  return (
    <Card title={t('add.shop')} extra={<LanguageList />}>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>

      <div className='steps-content'>
        {steps[current]?.content === 'First-content' && (
          <CreateShop next={next} user={true} />
        )}

        {steps[current]?.content === 'Second-content' && (
          <Map next={next} prev={prev} />
        )}

        {steps[current]?.content === 'Third-content' && (
          <ShopDelivery next={next} prev={prev} />
        )}
        {steps[current].content === 'Four-content' && (
          <UserEdit next={next} prev={prev} />
        )}
      </div>
    </Card>
  );
};
export default ShopsAdd;
