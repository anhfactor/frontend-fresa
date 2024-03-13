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

const SellerProductAdd = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [productId, setProductId] = useState(null);
  const [error, setError] = useState(null);
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {pathname} = useLocation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  const IS_GIFT_CARD = pathname.includes('seller/gift-card');

  console.log('IS_GIFT_CARD', IS_GIFT_CARD)

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

  function fetchProduct() {
    setLoading(true);
    productService
      .getByUuid(uuid)
      .then((res) => {
        console.log(res);
        setProductId(res.data.id);
        const data = {
          ...res.data,
          ...getLanguageFields(res?.data),
          category: createSelectObject(res.data.category),
          brand: createSelectObject(res.data.brand),
          unit: createSelectObject(res.data.unit),
          images: createImages(res.data.galleries),
        };
        form.setFieldsValue({
          ...data,
        });
        setFileList(data.images);
        dispatch(setMenuData({ activeMenu }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    fetchProduct();
  }, [activeMenu.refetch]);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      product_id: productId,
      min_qty: values.min_qty,
      max_qty: values.max_qty,
      active: values.active,
      quantity: values.quantity,
      price: values.price,
      tax: values.tax,
    };

    productService
      .create(body)
      .then(() => {
          if(IS_GIFT_CARD) {
              toast.success(t('successfully.created.gift.card'));
              const nextUrl = 'seller/gift-cards';
              dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
              navigate(`/${nextUrl}`);
              dispatch(fetchSellerGiftCards());
          } else {
              toast.success(t('successfully.created.product'));
              const nextUrl = 'seller/products';
              dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
              navigate(`/${nextUrl}`);
              dispatch(fetchSellerProducts());
          }
      })
      .catch((err) => setError(err))
      .finally(() => setLoadingBtn(false));
  };

  console.log('error', error);
  return (
    <Card title={t('add.product')} extra={<LanguageList />}>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        name='shopProduct'
        initialValues={{ active: true }}
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
              {!IS_GIFT_CARD && <Col span={12}>
                <Form.Item label={t('brand')} name='brand'>
                  <DebounceSelect disabled />
                </Form.Item>
              </Col>}
                {!IS_GIFT_CARD && <Col span={12}>
                    <Form.Item label={t('category')} name='category'>
                        <AsyncTreeSelect disabled />
                    </Form.Item>
                </Col>}
                {!IS_GIFT_CARD && <Col span={8}>
                    <Form.Item label={t('unit')} name='unit'>
                        <Select labelInValue={true} filterOption={false} disabled />
                    </Form.Item>
                </Col>}
              <Col span={8}>
                <Form.Item label={t('qr_code')} name='qr_code'>
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
export default SellerProductAdd;
