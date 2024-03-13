import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { removeFromMenu } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchShops } from '../../redux/slices/shop';
import Loading from '../../components/loading';
import PhoneInput from 'components/form/phone-input';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';
import EmailInput from 'components/form/email-input';

export default function UserEdit({ prev }) {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { params } = useSelector((state) => state.shop, shallowEqual);

  const showUserData = (uuid) => {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => {
        const data = res.data;
        form.setFieldsValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phone: data.phone,
          password_confirmation: data.password_confirmation,
          password: data.password,
        });
      })
      .finally(() => setLoading(false));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      phone: values.phone,
      password_confirmation: values.password_confirmation,
      password: values.password,
    };
    const data = {
      ...params,
      status: activeMenu.data.status ? activeMenu.data.status : undefined,
    };
    const nextUrl = 'shops';
    userService
      .update(activeMenu?.data?.seller?.uuid, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchShops(data));
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu?.data.seller) {
      showUserData(activeMenu?.data?.seller?.uuid);
    }
  }, []);

  return (
    <>
      {!loading ? (
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            ...activeMenu.data,
          }}
          onFinish={onFinish}
          className='py-4'
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('firstname')}
                name='firstname'
                help={error?.firstname ? error.firstname[0] : null}
                validateStatus={error?.firstname ? 'error' : 'success'}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('lastname')}
                name='lastname'
                help={error?.lastname ? error.lastname[0] : null}
                validateStatus={error?.lastname ? 'error' : 'success'}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input className='w-100' />
              </Form.Item>
            </Col>

            <Col span={12}>
              <PhoneInput label={t('phone')} name='phone' error={error} />
            </Col>

            <Col span={12}>
              <EmailInput label={t('email')} name='email' error={error} />
            </Col>

            <Col span={12}>
              <PasswordInput
                label={t('password')}
                name='password'
                error={error}
              />
            </Col>
            <Col span={12}>
              <PasswordConfirmInput
                label={t('password.confirmation')}
                name='password_confirmation'
                dependencies={['password']}
                error={error}
              />
            </Col>

            <Col span={24}>
              <Space>
                <Button type='primary' htmlType='submit' loading={loadingBtn}>
                  {t('save')}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      ) : (
        <Loading />
      )}
    </>
  );
}
