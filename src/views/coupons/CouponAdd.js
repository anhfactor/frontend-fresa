import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Card,
  Button,
  Row,
  Col,
  InputNumber,
} from 'antd';
import LanguageList from '../../components/language-list';
import { Context } from '../../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import couponService from '../../services/coupon';
import moment from 'moment';
import profileService from '../../services/profile';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';

const CouponAdd = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { defaultLang, setDefaultLang } = useContext(Context);
  const [names, setNames] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  function fetchCoupon() {
    setLoading(true);
    couponService
      .getById(id)
      .then(({ data }) => {
        setData(data);
        let namesArray = names;
        data.translations.forEach((item) => {
          let lang = item.locale;
          namesArray[lang] = item.title;
        });
        form.setFieldsValue({
          title: namesArray[defaultLang],
          expired_at: moment(data.expired_at, 'YYYY-MM-DD'),
        });
      })
      .finally(() => setLoading(false));
  }

  const onChangeName = (e) => {
    let namesArray = names;
    namesArray[defaultLang] = e.target.value;
    setNames(namesArray);
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const params = {
      ...values,
      shop_id: shop?.id,
      expired_at: moment(values.expired_at).format('YYYY-MM-DD'),
      title: names,
      qty: Number(values.qty),
      price: Number(values.price),
    };
    const nextUrl = 'coupons';
    if (id) {
      couponService
        .update(id, params)
        .then((res) => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    } else {
      couponService
        .create(params)
        .then((res) => {
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    }
  };

  const onFinishFailed = (values) => console.log('Failed:', values);

  useEffect(() => {
    if (id) {
      fetchCoupon();
    }
    fetchUserDetails();
  }, []);

  function fetchUserDetails() {
    profileService.get().then(({ data }) => setShop(data.shop));
  }

  return (
    <Card title={id ? t('edit.coupon') : t('add.coupon')} loading={loading}>
      <Form
        form={form}
        name='basic'
        initialValues={{
          ...data,
        }}
        layout='vertical'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('title')}
              name='title'
              rules={[{ required: true, message: t('required') }]}
            >
              <Input onChange={onChangeName} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('name')}
              name='name'
              rules={[{ required: true, message: t('required') }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('type')}
              name='type'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select>
                <Select.Option value='fix'>{t('fix')}</Select.Option>
                <Select.Option value='percent'>{t('percent')}</Select.Option>
              </Select>
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
              label={t('quantity')}
              name='qty'
              rules={[{ required: true, message: t('required') }]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('price')}
              name='price'
              rules={[{ required: true, message: t('required') }]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Form>
    </Card>
  );
};

export default CouponAdd;
