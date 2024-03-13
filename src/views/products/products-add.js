import React, { useState } from 'react';
import '../../assets/scss/components/product-add.scss';
import { steps } from './steps';
import { Card, Steps } from 'antd';
import ProductsIndex from './products-index';
import LanguageList from '../../components/language-list';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { Step } = Steps;

const ProductsAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [current, setCurrent] = useState(activeMenu.data?.step || 0);
  const next = () => {
    const step = current + 1;
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
          <ProductsIndex next={next} />
        )}
      </div>
    </Card>
  );
};
export default ProductsAdd;
