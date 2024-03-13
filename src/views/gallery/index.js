import React from 'react';
import { FcFolder } from 'react-icons/fc';
import { Card, Col, Row } from 'antd';
import ButtonFolder from '../../components/gallary-button';
import { useNavigate } from 'react-router-dom';
import { colLg } from '../../components/card-responsive';
import { useTranslation } from 'react-i18next';

const Gallery = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card title={t('gallery')} className='gallery-container'>
      <Row gutter={[24, 24]}>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/languages')}
            title={t('languages')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/categories')}
            title={t('categories')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/shops')}
            title={t('shops')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/brands')}
            title={t('brands')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/products')}
            title={t('products')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
        <Col {...colLg}>
          <Card
            cover={<FcFolder className='icon-folder' />}
            onClick={() => navigate('/gallery/users')}
            title={t('users')}
            className='folder'
          >
            <ButtonFolder />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Gallery;
