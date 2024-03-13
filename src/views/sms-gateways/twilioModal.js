import React, { useState } from 'react';
import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import smsService from '../../services/smsGateways';

export default function TwilioModal({ modal: data, handleCancel, refetch }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);

  const onFinish = (values) => {
    console.log('values => ', values);
    setLoadingBtn(true);
    smsService
      .update(data.id, values)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      visible={!!data}
      title={'Twilio'}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
          key='save-btn'
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel} key='cancel-btn'>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={data}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={'Twilio phone number'}
              name='from'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Messaging Service ID'
              name='service_id'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input min={0} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Account SID'
              name='api_key'
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
          <Col span={24}>
            <Form.Item
              label='Auth Token'
              name='secret_key'
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
          <Col span={24}>
            <Form.Item
              label='OTP template'
              name='text'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
                ({ getFieldValue }) => ({
                  validator() {
                    if (getFieldValue('text').includes('#OTP#')) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      '#OTP# is required as your code will be placed here'
                    );
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
