import React from 'react';
import { Button, Col, Descriptions, Row, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchSellerProducts } from '../../../redux/slices/product';
import { removeFromMenu } from '../../../redux/slices/menu';
import { toast } from 'react-toastify';
import {fetchSellerGiftCards} from "../../../redux/slices/giftCard";

const SellerProductFinish = ({ prev, isGiftCard }) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const data = activeMenu.data;

  function finish() {
    const nextUrl = isGiftCard ? 'seller/gift-cards' : 'seller/products';
    toast.success(t('successfully.edit.product'));
    dispatch(removeFromMenu({ activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    if(isGiftCard)
      dispatch(fetchSellerGiftCards());
    else
      dispatch(fetchSellerProducts());
  }

  return (
    <>
      <Descriptions title={t('product.info')} bordered>
        <Descriptions.Item label={`${t('title')} (${defaultLang})`} span={3}>
          {data[`title[${defaultLang}]`]}
        </Descriptions.Item>
        <Descriptions.Item
          label={`${t('description')} (${defaultLang})`}
          span={3}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: data[`description[${defaultLang}]`],
            }}
          />
        </Descriptions.Item>
        {!isGiftCard && <>
          <Descriptions.Item label={t('category')} span={1.5}>
          {data.category?.label}
          </Descriptions.Item>
          <Descriptions.Item label={t('brand')} span={1.5}>
            {data.brand?.label}
          </Descriptions.Item>
          <Descriptions.Item label={t('unit')} span={1.5}>
            {data.unit?.label}
          </Descriptions.Item>
        </>}

        <Descriptions.Item label={t('images')} span={3}>
          <Row gutter={12}>
            {data.images.map((item, idx) => (
              <Col key={'image' + idx}>
                <img width={80} alt='product' src={item.url} />
              </Col>
            ))}
          </Row>
        </Descriptions.Item>
        <Descriptions.Item label={t('qr_code')}>
          {data.qr_code}
        </Descriptions.Item>
        <Descriptions.Item label={t('keywords')}>
          {data.keywords}
        </Descriptions.Item>
      </Descriptions>
      <div className='d-flex justify-content-end mt-4'>
        <Space>
          <Button onClick={prev}>{t('prev')}</Button>
          <Button type='primary' onClick={finish}>
            {t('finish')}
          </Button>
        </Space>
      </div>
    </>
  );
};
export default SellerProductFinish;
