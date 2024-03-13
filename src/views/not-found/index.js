import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../../assets/scss/components/404.scss';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className='container'>
        <div className='header'>
          <h1 className='display-4 font-weight-bold first-four'>4</h1>
          <h1 className='display-4 font-weight-bold first-zero'>0</h1>
          <h1 className='display-4 font-weight-bold second-four'>4</h1>
        </div>
        <div>
          <h1 className='font-weight-bold mb-4 display-4'>
            {t('page.not.found')}
          </h1>
          <Button
            type='primary'
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
