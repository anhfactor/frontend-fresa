import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Switch,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../../redux/slices/menu';
import productService from '../../../services/seller/product';
import { DebounceSelect } from '../../../components/search';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { fetchShopBonus } from '../../../redux/slices/shop-bonus';
import shopBonusService from '../../../services/seller/shopBonus';

const ShopBonusAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    const body = {
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      status: values.status,
      bonus_product_id: values.bonus_product_id.value,
      bonus_quantity: values.bonus_quantity,
      order_amount: values.order_amount,
    };
    setLoadingBtn(true);
    const nextUrl = 'seller/bonus/shop';
    shopBonusService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchShopBonus());
      })
      .finally(() => setLoadingBtn(false));
    console.log('body', body);
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
    <Card title={t('add.bonus')} className='h-100'>
      <Form
        name='bonus-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ status: true, ...activeMenu.data }}
        className='d-flex flex-column h-100'
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('order_amount')}
              name={'order_amount'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber className='w-100' min={0} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('bonus.product')}
              name={'bonus_product_id'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                fetchOptions={fetchProducts}
                debounceTimeout={200}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='expired_at'
              label={t('expired.at')}
              rules={[{ required: true, message: t('required') }]}
            >
              <DatePicker
                className='w-100'
                placeholder=''
                disabledDate={(current) => moment().add(-1, 'days') >= current}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('bonus.product.quantity')}
              name={'bonus_quantity'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <InputNumber className='w-100' min={0} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('active')}
              name='status'
              valuePropName='checked'
            >
              <Switch />
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

export default ShopBonusAdd;
