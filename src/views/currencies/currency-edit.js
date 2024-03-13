import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Card,
  Button,
  Row,
  Col,
  Switch,
  InputNumber,
  Select,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import currencyService from '../../services/currency';
import { useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import { fetchCurrencies } from '../../redux/slices/currency';
import { useTranslation } from 'react-i18next';

export default function CurrencyEdit() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const fetchCurrency = (id) => {
    setLoading(true);
    currencyService
      .getById(id)
      .then(({ data }) => form.setFieldsValue(data))
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      ...values,
      active: Number(values.active),
    };
    const nextUrl = 'currencies';
    currencyService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchCurrencies({}));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchCurrency(id);
    }
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.currency')} loading={loading}>
      <Form
        name='currency-edit'
        onFinish={onFinish}
        form={form}
        layout='vertical'
        initialValues={{ ...activeMenu.data }}
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
              label={t('symbol')}
              name='symbol'
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

          <Col span={8}>
            <Form.Item
              label={t('rate')}
              name='rate'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                disabled={form.getFieldsValue('default').default}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('position')}
              name='position'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select>
                <Select.Option value='after'>{t('after')}</Select.Option>
                <Select.Option value='before'>{t('before')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={t('active')}
              name='active'
              valuePropName='checked'
            >
              <Switch disabled={form.getFieldsValue('default').default} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('default')}
              name='default'
              valuePropName='checked'
              hidden
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Form>
    </Card>
  );
}
