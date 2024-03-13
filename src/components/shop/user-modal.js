import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import userService from '../../services/user';
import EmailInput from 'components/form/email-input';
import PhoneInput from 'components/form/phone-input';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';

export default function UserModal({ visible, handleCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = (values) => {
    const payload = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      phone: values.phone,
      password_confirmation: values.password_confirmation,
      password: values.password,
      role: 'user',
    };
    setLoadingBtn(true);
    userService
      .create(payload)
      .then(() => {
        toast.success(t('successfully.added'));
        handleCancel();
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      title={t('add.client')}
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button
          key='ok-button'
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
        >
          {t('save')}
        </Button>,
        <Button key='cancel-button' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        name='user-add-form'
        form={form}
        onFinish={onFinish}
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
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={'lastname'}
              name='lastname'
              help={error?.lastname ? error.lastname[0] : null}
              validateStatus={error?.lastname ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input />
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
        </Row>
      </Form>
    </Modal>
  );
}
