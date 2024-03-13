import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Spin,
  Switch,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import productService from '../../../services/seller/product';
import { DebounceSelect } from '../../../components/search';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import bonusService from '../../../services/seller/bonus';
import { fetchBonus } from '../../../redux/slices/product-bonus';

const ProductBonusEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.expired_at = JSON.stringify(data?.expired_at);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  function getProducts(bonus) {
    form.setFieldsValue({
      ...bonus,
      shop_product_id: formatBannerProduct(bonus.shop_product),
      bonus_product_id: formatBannerProduct(bonus.bonus_product),
      expired_at: moment(bonus.expired_at, 'YYYY-MM-DD'),
    });
    setLoading(false);
  }

  const getBonus = (id) => {
    setLoading(true);
    bonusService
      .getById(id)
      .then((res) => {
        let bonus = res.data;
        getProducts(bonus);
      })
      .finally(() => dispatch(disableRefetch(activeMenu)));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      status: values.status,
      shop_product_id: values.shop_product_id.value,
      bonus_product_id: values.bonus_product_id.value,
      bonus_quantity: values.bonus_quantity,
      shop_product_quantity: values.shop_product_quantity,
    };
    bonusService
      .update(id, body)
      .then(() => {
        const nextUrl = 'seller/bonus/product';
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchBonus());
      })
      .finally(() => setLoadingBtn(false));
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

  useEffect(() => {
    if (activeMenu.refetch) {
      getBonus(id);
    }
  }, [activeMenu.refetch]);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.product?.translation?.title,
      value: item?.id,
    }));
  }

  function formatBannerProduct(data) {
    return {
      label: data?.product?.translation?.title || '',
      value: data?.id,
    };
  }

  const getInitialTimes = () => {
    if (!activeMenu.data?.expired_at) {
      return {};
    }
    const open_time = JSON.parse(activeMenu.data?.expired_at);
    return {
      expired_at: moment(open_time, 'HH:mm:ss'),
    };
  };

  return (
    <Card title={t('edit.bonus')} className='h-100'>
      {!loading ? (
        <Form
          name='bonus-edit'
          layout='vertical'
          onFinish={onFinish}
          form={form}
          initialValues={{
            active: true,
            ...activeMenu.data,
            ...getInitialTimes(),
          }}
          className='d-flex flex-column h-100'
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('products')}
                name={'shop_product_id'}
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
                label={t('product.quantity')}
                name={'shop_product_quantity'}
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
                name='expired_at'
                label={t('expired.at')}
                rules={[{ required: true, message: t('required') }]}
              >
                <DatePicker
                  className='w-100'
                  placeholder=''
                  disabledDate={(current) =>
                    moment().add(-1, 'days') >= current
                  }
                />
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

export default ProductBonusEdit;
