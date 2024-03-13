import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Spin } from 'antd';
import { debounce, isArray } from 'lodash';
import userService from '../../services/user';
import ticketService from '../../services/ticket';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromMenu } from '../../redux/slices/menu';
import { toast } from 'react-toastify';
import { DebounceSelect } from '../../components/search';

const { TextArea } = Input;

export default function TicketAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);

  const onFinish = (values) => {
    setLoading(true);
    const nextUrl = 'tickets';
    const data = {
      ...values,
      created_by: user.id,
      user_id: values.user_id.value,
    };
    ticketService
      .create(data)
      .then(() => {
        toast.success('Successfully created');
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
      })
      .finally(() => setLoading(false));
  };

  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
    };
    return userService.search(params).then(({ data }) => formatUser(data));
  }

  function formatUser(data) {
    if (!data) return;
    if (isArray(data)) {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    } else {
      return {
        label: `${data.firstname} ${data.lastname}`,
        value: data.id,
      };
    }
  }

  return (
    <Card title='Ticket add'>
      <Form name='basic' layout='vertical' onFinish={onFinish} form={form}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name='subject'
              label='Subject'
              rules={[{ required: true, message: '' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='user_id'
              label='User'
              rules={[{ required: true, message: '' }]}
            >
              <DebounceSelect fetchOptions={getUsers} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='content'
              label='Content'
              rules={[{ required: true, message: '' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loading}>
          Submit
        </Button>
      </Form>
    </Card>
  );
}
