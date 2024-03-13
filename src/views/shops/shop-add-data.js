import React from 'react';
import { Card, Col, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import { DebounceSelect } from '../../components/search';
import TextArea from 'antd/es/input/TextArea';
import userService from '../../services/user';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddressInput from '../../components/address-input';
import { AsyncSelect } from '../../components/async-select';
import groupService from '../../services/group';
import MediaUpload from '../../components/upload';
import Map from '../../components/map';
import { RefetchSearch } from '../../components/refetch-search';
import shopTagService from '../../services/shopTag';
import { useState } from 'react';
import PhoneInput from 'components/form/phone-input';

const ShopAddData = ({
  logoImage,
  setLogoImage,
  backImage,
  setBackImage,
  form,
  location,
  setLocation,
}) => {
  const { t } = useTranslation();
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const [userRefetch, setUserRefetch] = useState(null);
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
  async function fetchUserList(search) {
    const params = { search, 'roles[0]': 'user' };
    return userService.search(params).then((res) =>
      res.data.map((item) => ({
        label: item.firstname || '' + ' ' + item.lastname || '',
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
    <>
      <Card>
        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label={t('logo.image')}>
              <MediaUpload
                type='shops/logo'
                imageList={logoImage}
                setImageList={setLogoImage}
                form={form}
                multiple={false}
                name='logo_img'
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={t('background.image')}>
              <MediaUpload
                type='shops/background'
                imageList={backImage}
                setImageList={setBackImage}
                form={form}
                multiple={false}
                name='background_img'
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name='status' label={t('status')}>
              <Select disabled>
                <Select.Option value='new'>{t('new')}</Select.Option>
                <Select.Option value='edited'>{t('edited')}</Select.Option>
                <Select.Option value='approved'>{t('approved')}</Select.Option>
                <Select.Option value='rejected'>{t('rejected')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('status.note')} name='status_note'>
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={t('open')} name='open' valuePropName='checked'>
              <Switch disabled />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Card title={t('general')}>
        <Row gutter={24}>
          <Col span={12}>
            {languages.map((item, idx) => (
              <Form.Item
                key={'title' + idx}
                label={t('title')}
                name={`title[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                  { min: 2, message: t('title.requared') },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('seller')}
              name='user'
              rules={[{ required: true, message: t('required') }]}
            >
              <DebounceSelect fetchOptions={fetchUserList} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('group')}
              name='group_id'
              rules={[{ required: true, message: t('required') }]}
            >
              <AsyncSelect fetchOptions={fetchGroup} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          <Col span={12}>
            <PhoneInput label={t('phone')} name='phone' />
          </Col>
          <Col span={12}>
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
                  { min: 2, message: t('title.requared') },
                ]}
                hidden={item.locale !== defaultLang}
              >
                <TextArea rows={4} />
              </Form.Item>
            ))}
          </Col>
        </Row>
      </Card>
      <Row gutter={24}>
        <Col span={8}>
          <Card title={t('delivery')}>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name='price'
                  label={t('min.price')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber className='w-100' min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='price_per_km'
                  label={t('price.per.km')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber className='w-100' min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('delivery.time')}>
            <Row gutter={12}>
              <Col span={12}>
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name='delivery_time_from'
                  label={t('delivery_time_from')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber className='w-100' min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='delivery_time_to'
                  label={t('delivery_time_to')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber className='w-100' min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('order.info')}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label={t('min.amount')}
                  name='min_amount'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('tax')}
                  name='tax'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} addonAfter={'%'} className='w-100' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('admin.comission')}
                  name='percentage'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <InputNumber min={0} className='w-100' addonAfter={'%'} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Card title={t('address')}>
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item, idx) => (
              <AddressInput
                setLocation={setLocation}
                form={form}
                item={item}
                idx={idx}
                key={idx}
                defaultLang={defaultLang}
              />
            ))}
          </Col>
          <Col span={24}>
            <Map
              location={location}
              setLocation={setLocation}
              setAddress={(value) =>
                form.setFieldsValue({ [`address[${defaultLang}]`]: value })
              }
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default ShopAddData;
