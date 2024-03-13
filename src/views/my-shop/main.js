import React from 'react';
import { Card, Steps } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setMenuData } from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from '../../helpers/useQueryParams';
import ShopMain from './edit';
import Delivery from './shopDelivery';
import Map from './map';
import { useState } from 'react';

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
];

export default function MyShopEdit() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const queryParams = useQueryParams();

  const current = Number(queryParams.values?.step || 0);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
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
    <Card title={t('shop.edit')} extra={<LanguageList />}>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      <div className='steps-content'>
        {steps[current].content === 'First-content' && <ShopMain next={next} />}
        {steps[current].content === 'Second-content' && (
          <Map prev={prev} next={next} />
        )}
        {steps[current].content === 'Third-content' && <Delivery prev={prev} />}
      </div>
    </Card>
  );
}
