import React, { useState } from 'react';
import { Card, Steps } from 'antd';
import LanguageList from '../../../components/language-list';
import { steps } from './steps';
import ProductsIndex from './product-index';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import ProductProperty from './product-property';
import SellerProductFinish from './product-finish';

const { Step } = Steps;

const NewProductAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [current, setCurrent] = useState(activeMenu.data?.step || 0);
  const [uuid, setUuid] = useState(null);
  const next = () => {
    const step = current + 1;
    setCurrent(step);
  };

  const prev = () => {
    const step = current - 1;
    setCurrent(step);
  };

  return (
    <Card title={t('add.product')} extra={<LanguageList />}>
      <Steps current={current}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      <div className='steps-content'>
        {steps[current].content === 'First-content' && (
          <ProductsIndex next={next} setUuid={setUuid} />
        )}
        {steps[current].content === 'Second-content' && (
          <ProductProperty next={next} prev={prev} uuid={uuid} />
        )}
        {steps[current].content === 'Third-content' && (
          <SellerProductFinish prev={prev} />
        )}
      </div>
    </Card>
  );
};

export default NewProductAdd;
