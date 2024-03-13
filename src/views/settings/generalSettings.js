import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import ImageUploadSingle from '../../components/image-upload-single';
import settingService from '../../services/settings';
import { toast } from 'react-toastify';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import { fetchSettings as getSettings } from '../../redux/slices/globalSettings';
import createImage from '../../helpers/createImage';
import Loading from '../../components/loading';
import Map from '../../components/map';
import PhoneInput from 'components/form/phone-input';

const defaultLocation = {
  lat: 47.4143302506288,
  lng: 8.532059477976883,
};

export default function GeneralSettings() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();

  const [logo, setLogo] = useState(activeMenu.data?.logo || null);
  const [favicon, setFavicon] = useState(activeMenu.data?.favicon || null);
  const [location, setLocation] = useState(
    activeMenu.data?.location || defaultLocation
  );
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const createSettings = (list) => {
    const result = list.map((item) => ({
      [item.key]: item.value,
    }));
    return Object.assign({}, ...result);
  };

  function fetchSettings() {
    setLoading(true);
    settingService
      .get()
      .then((res) => {
        const data = createSettings(res.data);
        const locationArray = data.location.split(',');
        data.logo = createImage(data.logo);
        data.favicon = createImage(data.favicon);
        data.location = {
          lat: Number(locationArray[0]),
          lng: Number(locationArray[1]),
        };
        setLocation(data.location);
        setLogo(data.logo);
        setFavicon(data.favicon);
        form.setFieldsValue(data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchSettings();
    }
  }, [activeMenu.refetch]);

  function updateSettings(data) {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  }

  const onFinish = (values) => {
    const body = {
      ...values,
      favicon: values.favicon.name,
      logo: values.logo.name,
      location: `${location.lat}, ${location.lng}`,
    };
    updateSettings(body);
  };

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      onFinish={onFinish}
      initialValues={{ delivery: '1', ...activeMenu.data }}
    >
      {!loading ? (
        <>
          <Card
            title={t('project.settings')}
            extra={
              <Button
                type='primary'
                onClick={() => form.submit()}
                loading={loadingBtn}
              >
                {t('save')}
              </Button>
            }
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={t('title')}
                  name='title'
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
              <Col span={12}>
                <Form.Item
                  label={t('delivery')}
                  name='delivery'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <Select disabled>
                    <Select.Option value='0'>{t('admin')}</Select.Option>
                    <Select.Option value='1'>{t('seller')}</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('commission')}
                  name='commission'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label={t('favicon')}
                  name='favicon'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <ImageUploadSingle
                    type='languages'
                    image={favicon}
                    setImage={setFavicon}
                    form={form}
                    name='favicon'
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label={t('logo')}
                  name='logo'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <ImageUploadSingle
                    type='languages'
                    image={logo}
                    setImage={setLogo}
                    form={form}
                    name='logo'
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={t('map')} name='location'>
                  <Map location={location} setLocation={setLocation} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('config')}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={t('google.map.key')}
                  name='google_map_key'
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
            </Row>
          </Card>

          <Card title={t('footer')}>
            <Row gutter={12}>
              <Col span={12}>
                <PhoneInput label={t('phone')} name='phone' />
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('address')}
                  name='address'
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
              <Col span={12}>
                <Form.Item
                  label={t('footer.text')}
                  name='footer_text'
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
            </Row>
          </Card>
        </>
      ) : (
        <Loading />
      )}
    </Form>
  );
}
