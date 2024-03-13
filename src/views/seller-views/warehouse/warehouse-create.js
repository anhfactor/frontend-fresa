import { Button, Card, Col, Form, InputNumber, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from '../../../components/search';
import React, { useState } from 'react';
import productService from '../../../services/seller/product';
import userService from '../../../services/seller/user';
import TextArea from 'antd/es/input/TextArea';
import warehouseService from '../../../services/seller/warehouse';
import { toast } from 'react-toastify';
import { removeFromMenu } from '../../../redux/slices/menu';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWarehouse } from '../../../redux/slices/warehouse';

const typeOptions = [
  { label: 'income', value: 'income' },
  { label: 'outcome', value: 'outcome' },
];

function WarehouseCreate() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const fetchProductsTitle = async (productTitle) => {
    try {
      setLoading(true);
      const params = { search: productTitle, perPage: 10 };
      const { data } = await productService.search(params);
      return data.map((product) => ({
        label: product.translation.title,
        value: product.id,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (username) => {
    try {
      setLoading(true);
      const params = { search: username, perPage: 10 };
      const { data } = await userService.search(params);
      console.log(data);
      return data.map((user) => ({ label: user.firstname, value: user.id }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const data = {
      shop_product_id: values.shop_product_id.value,
      user_id: values.user_id.value,
      note: values.note,
      quantity: values.quantity,
      type: values.type,
    };

    warehouseService
      .create(data)
      .then((res) => {
        const nextUrl = 'seller/warehouse';
        toast.success(t('successfully.create.warehouse.action'));
        dispatch(removeFromMenu({ activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchWarehouse());
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('create.warehouse')}>
      <Form onFinish={onFinish} layout='vertical' form={form}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name='shop_product_id'
              label={t('product')}
              rules={[{ required: true, message: t('required') }]}
            >
              <DebounceSelect
                fetchOptions={fetchProductsTitle}
                loading={loading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={'user_id'}
              label={t('user')}
              rules={[{ required: true, message: t('required') }]}
            >
              <DebounceSelect loading={loading} fetchOptions={fetchUsers} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={'quantity'}
              label={t('quantity')}
              rules={[{ required: true, message: t('required') }]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={'type'}
              label={t('type')}
              rules={[{ required: true, message: t('required') }]}
            >
              <Select options={typeOptions} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name={'note'}
              label={t('note')}

            >
              <TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type='primary'
          htmlType='submit'
          loading={loadingBtn}
          disabled={loadingBtn}
        >
          {t('submit')}
        </Button>
      </Form>
    </Card>
  );
}

export default WarehouseCreate;
