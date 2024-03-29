import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Spin, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchBanners } from '../../redux/slices/banner';
import productService from '../../services/product';
import productRestService from '../../services/rest/product';
import { DebounceSelect } from '../../components/search';
import bannerService from '../../services/banner';
import { IMG_URL } from '../../configs/app-global';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../components/language-list';
import getTranslationFields from '../../helpers/getTranslationFields';

const BannerEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  function getLanguageFields(data) {
    if (!data) {
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
      [`button_text[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.button_text,
    }));
    return Object.assign({}, ...result);
  }

  function getProducts(ids, banner) {
    const result = ids.map((item, idx) => ({
      [`products[${idx}]`]: item,
    }));
    const params = Object.assign({}, ...result);
    productRestService
      .getProductByIds(params)
      .then(({ data }) => {
        form.setFieldsValue({
          ...banner,
          image: createImage(banner.img),
          products: formatProducts(data),
          ...getLanguageFields(banner),
        });
        setImage(createImage(banner.img));
      })
      .finally(() => setLoading(false));
  }

  const getBanner = (alias) => {
    setLoading(true);
    bannerService
      .getById(alias)
      .then((res) => {
        let banner = res.data;
        getProducts(banner.products, banner);
      })
      .finally(() => dispatch(disableRefetch(activeMenu)));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      url: values.url,
      shop_id: values.shop_id,
      img: image?.name,
      products: values.products.map((item) => item.value),
      title: getTranslationFields(languages, values, 'title'),
      description: getTranslationFields(languages, values, 'description'),
      button_text: getTranslationFields(languages, values, 'button_text'),
    };
    bannerService
      .update(id, body)
      .then(() => {
        const nextUrl = 'banners';
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchBanners());
        console.log('body => ', body);
      })
      .finally(() => setLoadingBtn(false));
  };

  function fetchProducts(search) {
    const params = {
      search,
      perPage: 10,
      shop_id: 0,
    };
    return productService
      .getAll(params)
      .then((res) => formatProducts(res.data));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      getBanner(id);
    }
  }, [activeMenu.refetch]);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.product?.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Card title={t('edit.banner')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <Form
          name='banner-add'
          layout='vertical'
          onFinish={onFinish}
          form={form}
          initialValues={{ active: true, ...activeMenu.data }}
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
                  normalize={(value, prevVal, prevVals) => value.trim()}
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
                  normalize={(value, prevVal, prevVals) => value.trim()}
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
                  normalize={(value, prevVal, prevVals) => value.trim()}
                >
                  <Input />
                </Form.Item>
              ))}
            </Col>
            <Col span={12}>
              <Form.Item label={t('url')} name={'url'}>
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={t('products')}
                name='products'
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
              <Button
                type='primary'
                htmlType='submit'
                loading={loadingBtn}
                disabled={loadingBtn}
              >
                {t('submit')}
              </Button>
            </div>
          </div>
        </Form>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default BannerEdit;
