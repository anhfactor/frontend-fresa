import React, { useEffect, useState } from 'react';
import { Button, Col, Descriptions, Row, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { removeFromMenu } from '../../redux/slices/menu';
import { fetchProducts } from '../../redux/slices/product';
import { useTranslation } from 'react-i18next';
import productService from '../../services/product';
import { IMG_URL } from '../../configs/app-global';
import Loading from '../../components/loading';
import {fetchGiftCards} from "../../redux/slices/giftCard";
const ProductFinish = ({ prev, isGiftCard }) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang } = useSelector((state) => state.formLang, shallowEqual);
  const { params } = useSelector((state) => state.product, shallowEqual);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState({});
  const { uuid } = useParams();
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const [loading, setLoading] = useState(false);

  function getLanguageFields(data) {
    if (!data?.translations) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.description,
    }));
    return Object.assign({}, ...result);
  }

  function fetchProduct(uuid) {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        const data = {
          ...res.data,
          ...getLanguageFields(res.data),
          properties: res.data.properties.map((item, index) => ({
            id: index,
            [`key[${item.locale}]`]: item.key,
            [`value[${item.locale}]`]: item.value,
          })),
          translation: undefined,
          translations: undefined,
        };
        setData(data);
      })
      .finally(() => setLoading(false));
  }

  function finish() {
    const nextUrl = isGiftCard ? 'catalog/gift-cards' : 'catalog/products';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    const paramsData = {
      perPage: params?.perPage,
      page: params?.page,
    };
    dispatch(isGiftCard ? fetchGiftCards(paramsData) : fetchProducts(paramsData));
    navigate(`/${nextUrl}`);
  }

  useEffect(() => {
    fetchProduct(uuid);
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Descriptions title={t('product.info')} bordered>
            <Descriptions.Item
              label={`${t('title')} (${defaultLang})`}
              span={3}
            >
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
            {!isGiftCard && (
              <>
                <Descriptions.Item label={t('category')} span={1.5}>
                  {data.category?.translation?.title}
                </Descriptions.Item>
                <Descriptions.Item label={t('brand')} span={1.5}>
                  {data.brand?.title}
                </Descriptions.Item>
                <Descriptions.Item label={t('unit')} span={1.5}>
                  {data?.unit?.translation.title}
                </Descriptions.Item>
              </>
            )}

            <Descriptions.Item label={t('images')} span={3}>
              <Row gutter={12}>
                {data?.galleries?.map((item, idx) => (
                  <Col key={'image' + idx}>
                    <img width={80} alt='product' src={IMG_URL + item.path} />
                  </Col>
                ))}
              </Row>
            </Descriptions.Item>
            <Descriptions.Item label={t('qr.code')}>
              {data?.qr_code}
            </Descriptions.Item>
            <Descriptions.Item label={t('keywords')}>
              {data?.keywords}
            </Descriptions.Item>
          </Descriptions>
          <div className='d-flex justify-content-end mt-4'>
            <Space>
              <Button onClick={prev} disabled={loading}>
                {t('prev')}
              </Button>
              <Button type='primary' onClick={finish} disabled={loading}>
                {t('finish')}
              </Button>
            </Space>
          </div>
        </>
      )}
    </>
  );
};

export default ProductFinish;
