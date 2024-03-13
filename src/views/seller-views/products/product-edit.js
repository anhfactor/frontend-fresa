import React, { useEffect, useState } from 'react';
import '../../../assets/scss/components/product-add.scss';
import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antd';
import LanguageList from '../../../components/language-list';
import { useTranslation } from 'react-i18next';
import Input from 'antd/es/input/Input';
import TextArea from 'antd/es/input/TextArea';
import { DebounceSelect } from '../../../components/search';
import { AsyncTreeSelect } from '../../../components/async-tree-select';
import ImageGallery from '../../../components/image-gallery';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { IMG_URL } from '../../../configs/app-global';
import productService from '../../../services/seller/product';
import { toast } from 'react-toastify';
import Loading from '../../../components/loading';
import { fetchSellerProducts } from '../../../redux/slices/product';
import MediaUpload from '../../../components/upload';
import {fetchSellerGiftCards} from "../../../redux/slices/giftCard";

const SellerProductEdit = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [productId, setProductId] = useState([]);
  const [error, setError] = useState(null);
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { params } = useSelector((state) => state.product, shallowEqual);
  const {pathname} = useLocation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  const IS_GIFT_CARD = pathname.includes('gift-card/edit');

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

  const createSelectObject = (item) => {
    if (!item) return null;
    return {
      label: item.translation ? item.translation.title : item.title,
      value: item.id,
    };
  };

  const createImages = (items) =>
    items.map((item) => ({
      uid: item.id,
      name: item.path,
      url: IMG_URL + item.path,
    }));

  function fetchProduct(uuid) {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        setProductId([res.data.id, res.data.product.id]);
        const data = {
          ...res?.data,
          ...getLanguageFields(res.data?.product),
          category: createSelectObject(res.data.product?.category),
          brand: createSelectObject(res.data.product?.brand),
          unit: createSelectObject(res.data.product?.unit),
          images: createImages(res.data.product?.galleries),
          qr_code: res.data.product?.qr_code,
        };
        setFileList(data.images);
        form.setFieldsValue({ ...data });
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct(uuid);
    }
  }, [activeMenu.refetch]);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      product_id: productId[1],
      min_qty: values.min_qty,
      max_qty: values.max_qty,
      active: values.active,
      quantity: values.quantity,
      price: values.price,
      tax: values.tax,
    };
    productService
      .update(productId[0], body)
      .then(() => {
        if(IS_GIFT_CARD) {
          const nextUrl ='seller/gift-cards';
          toast.success( t('successfully.edit.gift.card') );
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
          const page = {
            page: params.page,
            perPage: params.perPage,
          };
          dispatch(fetchSellerGiftCards(page));
        } else {
          const nextUrl = 'seller/products';
          toast.success( t('successfully.edit.product'));
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
          const page = {
            page: params.page,
            perPage: params.perPage,
          };
          dispatch(fetchSellerProducts(page));
        }

      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  console.log('activeMenu.data', activeMenu);

  return (
    <Card title={IS_GIFT_CARD ? t('edit.gift.card') : t('edit.product')} extra={<LanguageList />}>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        name='shopProduct'
        initialValues={{ active: true, ...activeMenu.data }}
      >
        {!loading ? (
          <>
            <Row gutter={12}>
              <Col span={12}>
                {languages.map((item) => (
                  <Form.Item
                    key={'name' + item.id}
                    label={t('name')}
                    name={`title[${item.locale}]`}
                    hidden={item.locale !== defaultLang}
                  >
                    <Input disabled />
                  </Form.Item>
                ))}
              </Col>
              <Col span={12}>
                {languages.map((item) => (
                  <Form.Item
                    key={'description' + item.id}
                    label={t('description')}
                    name={`description[${item.locale}]`}
                    hidden={item.locale !== defaultLang}
                  >
                    <TextArea rows={4} disabled />
                  </Form.Item>
                ))}
              </Col>
              {!IS_GIFT_CARD &&
                <>
                  <Col span={12}>
                    <Form.Item label={t('brand')} name='brand'>
                      <DebounceSelect disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={t('category')} name='category'>
                      <AsyncTreeSelect disabled />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item label={t('unit')} name='unit'>
                      <Select labelInValue={true} filterOption={false} disabled />
                    </Form.Item>
                  </Col>
                </>
              }

              <Col span={8}>
                <Form.Item
                  label={t('qr_code')}
                  name='qr_code'
                  help={error?.qr_code ? error.qr_code[0] : null}
                  validateStatus={error?.qr_code ? 'error' : 'success'}
                >
                  <InputNumber min={0} className='w-100' disabled />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={t('tax')}
                  name='tax'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' addonAfter='%' />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label={t('min.qty')}
                  name='min_qty'
                  rules={[{ required: true, message: t('required') }]}
                  help={error?.max_qty ? error.max_qty[0] : null}
                  validateStatus={error?.max_qty ? 'error' : 'success'}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('max.qty')}
                  name='max_qty'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('price')}
                  name='price'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('quantity')}
                  name='quantity'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('active')}
                  name='active'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={t('images')} name='images'>
                  <MediaUpload
                    type='products'
                    imageList={fileList}
                    setImageList={setFileList}
                    form={form}
                    disabled={true}
                  />
                  {/* <ImageGallery
                    type='products'
                    fileList={fileList}
                    setFileList={setFileList}
                    form={form}
                    disabled={true}
                  /> */}
                </Form.Item>
              </Col>
            </Row>
            <Button
              type='primary'
              htmlType='submit'
              loading={loadingBtn}
              disabled={loadingBtn}
            >
              {t('save')}
            </Button>
          </>
        ) : (
          <Loading />
        )}
      </Form>
    </Card>
  );
};
export default SellerProductEdit;
