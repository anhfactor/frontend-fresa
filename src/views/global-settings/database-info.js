import React, { useState } from 'react';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import installationService from '../../services/installation';
import PasswordInput from 'components/form/password-input';

export default function DatabaseInfo({ next }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState();

  function databaseMigration() {
    installationService
      .migrationRun()
      .then((res) => console.log('res => ', res));
  }

  const onFinish = (values) => {
    console.log('values => ', values);
    const data = {
      ...values,
      env: 1,
    };
    setLoading(true);
    installationService
      .updateDatabase(data)
      .then(() => {
        next();
        databaseMigration();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card
      title='Database info'
      className='w-100'
      extra={<p>Fill database credentials</p>}
    >
      <Form form={form} onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='Database'
              name='database'
              rules={[{ required: true, message: 'Missing database name' }]}
            >
              <Input autoComplete='off' />
            </Form.Item>

            <Form.Item
              label='Username'
              name='username'
              rules={[{ required: true, message: '' }]}
            >
              <Input type='text' autoComplete='off' />
            </Form.Item>

            <PasswordInput
              label='Password'
              name='password'
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
          Save
        </Button>
      </Form>
    </Card>
  );
}
