import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../../services/user';
import { useTranslation } from 'react-i18next';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';

export default function UserPassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { uuid } = useParams();

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      password: values.password ? values.password : undefined,
      password_confirmation: values.password_confirmation,
    };
    userService
      .updatePassword(uuid, body)
      .then(() => {
        toast.success(t('successfully.created'));
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('user.password.change')}>
      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <PasswordInput label={t('password')} name='password' />
          </Col>
          <Col span={12}>
            <PasswordConfirmInput
              label={t('password.confirmation')}
              name='password_confirmation'
              dependencies={['password']}
            />
          </Col>

          <Col span={24}>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
