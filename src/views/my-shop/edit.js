import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Card,
  Space,
  Row,
  Col,
  Select,
  Switch,
  Input,
  InputNumber,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import shopService from '../../services/seller/shop';
import { IMG_URL } from '../../configs/app-global';
import moment from 'moment';
import ImageUploadSingle from '../../components/image-upload-single';
import TextArea from 'antd/lib/input/TextArea';
import Map from '../../components/map';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from '../../helpers/getDefaultLocation';
import { fetchMyShop } from '../../redux/slices/myShop';
import { AsyncSelect } from 'components/async-select';
import { RefetchSearch } from 'components/refetch-search';
import groupService from 'services/group';
import shopTagService from 'services/seller/shopTag';
import PhoneInput from 'components/form/phone-input';

export default function MyShopEdit({ next }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(getDefaultLocation(settings));
  const [userRefetch, setUserRefetch] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(activeMenu.data?.logo_img || null);
  const [backImage, setBackImage] = useState(
    activeMenu.data?.background_img || null
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

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
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  const fetchShop = () => {
    setLoading(true);
    shopService
      .get()
      .then(({ data }) => {
        console.log(data);
        form.setFieldsValue({
          ...data,
          ...getLanguageFields(data),
          logo_img: createImage(data.logo_img),
          background_img: createImage(data.background_img),
          delivery_time_type: data.delivery_time?.type,
          delivery_time_from: data.delivery_time?.from,
          delivery_time_to: data.delivery_time?.to,
          tags: data.tags?.map((item) => ({
            label: item.translation?.title || 'no name',
            value: item.id,
          })),
          group_id: {
            label: data.group?.translation?.title || 'no translation',
            value: data.group?.id,
          },
        });
        setBackImage(createImage(data.background_img));
        setLogoImage(createImage(data.logo_img));
        setLocation({
          lat: Number(data.location?.latitude),
          lng: Number(data.location?.longitude),
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const tags = values.tags;
    const newObject = {};
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        newObject[`tags[${i}]`] = tags[i].value;
      }
    }
    const body = {
      ...values,
      'images[0]': logoImage?.name,
      'images[1]': backImage?.name,
      location: location.lat + ',' + location.lng,
      ...newObject,
      group_id: values.group_id.value,
    };
    delete body.tags;
    shopService
      .update(body)
      .then(() => {
        toast.success(t('successfully.updated'));
        next();
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleCancel = () => {
    const nextUrl = 'my-shop';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
  };

  async function fetchShopTag(search) {
    setUserRefetch(false);
    const params = { search };
    return shopTagService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
      }))
    );
  }

  async function fetchGroup() {
    return groupService.getActive().then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title || 'no name',
        value: item.id,
      }))
    );
  }

  return (
    <Card loading={loading}>
      <Form
        form={form}
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        // initialValues={{
        //   ...activeMenu.data,
        // }}
      >
        <Row gutter={36}>
          <Col span={8}>
            <Card>
              <Space>
                <Form.Item label={t('logo.image')}>
                  <ImageUploadSingle
                    type={'shops/logo'}
                    image={logoImage}
                    setImage={setLogoImage}
                    form={form}
                    name='logo_img'
                  />
                </Form.Item>
                <Form.Item label={t('background.image')}>
                  <ImageUploadSingle
                    type={'shops/background'}
                    image={backImage}
                    setImage={setBackImage}
                    form={form}
                    name='background_img'
                  />
                </Form.Item>
              </Space>
              <Form.Item name='status' label={t('status')}>
                <Select disabled>
                  <Select.Option value={'new'}>{t('new')}</Select.Option>
                  <Select.Option value={'edited'}>{t('edited')}</Select.Option>
                  <Select.Option value={'approved'}>
                    {t('approved')}
                  </Select.Option>
                  <Select.Option value={'rejected'}>
                    {t('rejected')}
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label={t('open')}
                name='open'
                valuePropName='checked'
                hidden
              >
                <Switch disabled />
              </Form.Item>
              <Form.Item label={t('status.note')} name='status_note'>
                <TextArea rows={4} />
              </Form.Item>
            </Card>
            <Card title={t('delivery')}>
              <Form.Item
                name='price'
                label={t('min.price')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
              <Form.Item
                name='price_per_km'
                label={t('price.per.km')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Card>
            <Card title={t('delivery.time')}>
              <Form.Item
                name='delivery_time_type'
                label={t('delivery_time_type')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Select className='w-100'>
                  <Select.Option value='minute' label={t('minutes')} />
                  <Select.Option value='hour' label={t('hour')} />
                </Select>
              </Form.Item>
              <Form.Item
                name='delivery_time_from'
                label={t('delivery_time_from')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
              <Form.Item
                name='delivery_time_to'
                label={t('delivery_time_to')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Card>
          </Col>

          <Col span={16}>
            <Card title={t('general')}>
              <Row>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'title' + idx}
                      label={t('name')}
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
                <Col span={24}>
                  <PhoneInput label={t('phone')} name='phone' />
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('group')}
                    name='group_id'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <AsyncSelect fetchOptions={fetchGroup} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('shop.tags')}
                    name='tags'
                    rules={[{ required: false, message: t('required') }]}
                  >
                    <RefetchSearch
                      mode='multiple'
                      fetchOptions={fetchShopTag}
                      refetch={userRefetch}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'desc' + idx}
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
                      <TextArea rows={4} />
                    </Form.Item>
                  ))}
                </Col>
              </Row>
            </Card>
            <Card title={t('order.info')}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={t('min.amount')}
                    name='min_amount'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('tax')}
                    name='tax'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('percentage')}
                    name='percentage'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card title={t('address')}>
              <Row gutter={12}>
                <Col span={12}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'address' + idx}
                      label={t('address')}
                      name={`address[${item.locale}]`}
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
                <Col span={24}>
                  <Map
                    location={location}
                    setLocation={setLocation}
                    setAddress={(value) =>
                      form.setFieldsValue({
                        [`address[${defaultLang}]`]: value,
                      })
                    }
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
        </Space>
      </Form>
    </Card>
  );
}
