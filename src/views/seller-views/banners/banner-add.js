import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import ImageUploadSingle from '../../../components/image-upload-single';
import { fetchSellerBanners } from '../../../redux/slices/banner';
import productService from '../../../services/seller/product';
import { DebounceSelect } from '../../../components/search';
import bannerService from '../../../services/seller/banner';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../../helpers/getTranslationFields';
import LanguageList from '../../../components/language-list';

const SellerBannerAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    const body = {
      url: values.url,
      shop_id: values.shop_id,
      img: image?.name,
      products: values.products.map((item) => item.value),
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      button_text: getTranslationFields(languages, values, 'button_text'),
    };
    setLoadingBtn(true);
    const nextUrl = 'seller/banner';
    bannerService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchSellerBanners());
      })
      .finally(() => setLoadingBtn(false));
  };

  function fetchProducts(search) {
    const params = {
      search,
      perPage: 10,
    };
    return productService
      .getAll(params)
      .then((res) => formatProducts(res.data));
  }

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.product.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Card title={t('add.banner')} className='h-100' extra={<LanguageList />}>
      <Form
        name='banner-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ clickable: true, ...activeMenu.data }}
        className='d-flex flex-column h-100'
      >
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'title' + item.locale}
                label={t('title')}
                name={`title[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'description' + item.locale}
                label={t('description')}
                name={`description[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'button_text' + item.locale}
                label={t('button_text')}
                name={`button_text[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('url')}
              name={'url'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t('products')}
              name={'products'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                mode='multiple'
                fetchOptions={fetchProducts}
                debounceTimeout={200}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('image')}
              name='image'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='banners'
                image={image}
                setImage={setImage}
                form={form}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className='flex-grow-1 d-flex flex-column justify-content-end'>
          <div className='pb-5'>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default SellerBannerAdd;
