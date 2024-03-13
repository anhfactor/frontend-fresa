import React, { useState } from 'react';
import { Form, Input, Card, Row, Col, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import installationService from '../../services/installation';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../redux/slices/auth';
import { data } from '../../configs/menu-config-test';
import PhoneInput from 'components/form/phone-input';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';
import { t } from 'i18next';
import EmailInput from 'components/form/email-input';

export default function UserInfo() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = (values) => {
    console.log('values => ', values);
    setLoading(true);
    installationService
      .createAdmin(values)
      .then((res) => {
        const user = {
          fullName: res.data.user.firstname + ' ' + res.data.user.lastname,
          role: res.data.user.role,
          urls: data[res.data.user.role],
          img: '',
          token: res.data.access_token,
          email: res.data.user.email,
          id: res.data.user.id,
        };
        dispatch(setUserData(user));
        localStorage.setItem('token', res.data.access_token);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card
      title='User info'
      extra={<p>Fill admin credentials</p>}
      className='w-100'
    >
      <Form form={form} onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='First name'
              name='firstname'
              rules={[{ required: true, message: 'Missing user firstname' }]}
            >
              <Input autoComplete='off' />
            </Form.Item>
            <Form.Item
              label='Last name'
              name='lastname'
              rules={[{ required: true, message: 'Missing user lastname' }]}
            >
              <Input autoComplete='off' />
            </Form.Item>
            <EmailInput label={t('email')} name='email' />
            <PhoneInput label='Phone' name='phone' />
            <PasswordInput
              label={t('password')}
              name='password'
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
            <PasswordConfirmInput
              label={t('password.confirmation')}
              name='password_confirmation'
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Col>
        </Row>
        <Button
          type='primary'
          htmlType='submit'
          loading={loading}
          className='mt-4'
        >
          Submit
        </Button>
      </Form>
    </Card>
  );
}
