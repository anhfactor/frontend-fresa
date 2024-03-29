import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Form,
  Input,
  Spin,
  Select,
  Card,
  Switch,
  Row,
  Col,
  InputNumber,
  Button,
} from 'antd';
import moment from 'moment';
import LanguageList from '../../components/language-list';
import deliveryService from '../../services/delivery-type';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from '../../redux/slices/menu';
import { fetchDeliveries } from '../../redux/slices/delivery';
import { useTranslation } from 'react-i18next';

const DeliveryAdd = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('free');
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [days, setDays] = useState(createDays());
  const [startDay, setStartDay] = useState(0);

  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  function createDays() {
    let days = [];
    for (let index = 1; index <= 31; index++) {
      days.push(index);
    }
    return days;
  }

  const fetchDelivery = (id) => {
    setLoading(true);
    deliveryService
      .getById(id)
      .then((res) => {
        let delivery = res.data;
        setType(delivery.type);
        form.setFieldsValue({
          ...delivery,
          ...getLanguageFields(delivery),
          from: delivery.times[0],
          to: delivery.times[1],
        });
      })
      .finally(() => setLoading(false));
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
    }));
    return Object.assign({}, ...result);
  }

  function createTime(times) {
    if (!times?.length) {
      return undefined;
    }
    const result = [
      moment(times[0]).format('HH:mm:ss'),
      moment(times[1]).format('HH:mm:ss'),
    ];
    return result.join(',');
  }

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      ...values,
      active: Number(values.active),
      times: `${values.from},${values.to}`,
    };
    const nextUrl = 'delivery/list';
    if (!id) {
      deliveryService
        .create(body)
        .then(() => {
          toast.success(t('successfully.created'));
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchDeliveries());
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    } else {
      deliveryService
        .update(id, body)
        .then(() => {
          toast.success(t('successfully.updated'));
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          dispatch(fetchDeliveries());
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    }
  };

  useEffect(() => {
    if (id) {
      fetchDelivery(id);
    }
  }, []);

  return (
    <Card
      title={id ? t('edit.delivery') : t('add.delivery')}
      extra={<LanguageList />}
    >
      <Form
        name='basic'
        layout='vertical'
        initialValues={{
          type: 'free',
          active: true,
        }}
        onFinish={onFinish}
        form={form}
      >
        {!loading ? (
          <>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name='type'
                  label={t('type')}
                  rules={[{ required: true, message: t('required') }]}
                >
                  <Select
                    className='w-100'
                    onSelect={(value) => setType(value)}
                  >
                    <Select.Option value='free'>{t('free')}</Select.Option>
                    <Select.Option value='pickup'>{t('pickup')}</Select.Option>
                    <Select.Option value='standard'>
                      {t('standard')}
                    </Select.Option>
                    <Select.Option value='express'>
                      {t('express')}
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} className='mt-3'>
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
                <Form.Item
                  label={t('note')}
                  name='note'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('from.day')}
                  name='from'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <Select onSelect={(value) => setStartDay(value)}>
                    {days.map((item) => (
                      <Select.Option key={item} value={item}>
                        {item}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('to.day')}
                  name='to'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <Select>
                    {days
                      .filter((item) => item > startDay)
                      .map((item) => (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              {type === 'standard' || type === 'express' ? (
                <Col span={12}>
                  <Form.Item
                    label={t('price')}
                    name='price'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              ) : (
                ''
              )}
              <Col span={6}>
                <Form.Item
                  label={t('active')}
                  name='active'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('save')}
            </Button>
          </>
        ) : (
          <div className='d-flex justify-content-center align-items-center'>
            <Spin size='large' className='py-5' />
          </div>
        )}
      </Form>
    </Card>
  );
};

export default DeliveryAdd;
