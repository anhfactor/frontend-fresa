import React, { useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { fetchDeliverymans } from '../../redux/slices/deliveryman';
import PhoneInput from 'components/form/phone-input';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';
import BirthdateValidator from 'components/form/birthdate-input';

export default function DeliverymanModal({ visibility, handleCancel }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthday, setBirthday] = useState(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const changeData = (data, dataText) => setBirthday(dataText);

  const onFinish = (values) => {
    const body = {
      ...values,
      role: 'deliveryman',
      birthday,
    };
    setLoading(true);
    userService
      .create(body)
      .then(() => {
        handleCancel();
        toast.success(t('successfully.created'));
        dispatch(fetchDeliverymans());
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={visibility}
      title={t('add.deliveryman')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
      className='large-modal'
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{ gender: 'male' }}
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
            <BirthdateValidator
              label={t('birthday')}
              name='birthday'
              valuePropName='data'
              onChange={changeData}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('gender')}
              name='gender'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select picker='dayTime' className='w-100'>
                <Select.Option value='male'>{t('male')}</Select.Option>
                <Select.Option value='female'>{t('female')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('email')}
              name='user_email'
              help={error?.email ? error.email[0] : null}
              validateStatus={error?.email ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input type='email' className='w-100' />
            </Form.Item>
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
