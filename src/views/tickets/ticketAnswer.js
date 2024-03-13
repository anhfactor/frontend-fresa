import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Form, Input, Modal, Spin } from 'antd';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticket';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
const { TextArea } = Input;

export default function TicketAnswer({ ticketId, setTicketId, fetchTickets }) {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [form] = Form.useForm();

  const handleOk = () => {
    console.log('ok');
  };

  const handleCancel = () => {
    setTicketId(null);
  };

  const onFinish = (values) => {
    setLoading(true);
    const postData = {
      ...values,
      created_by: user?.id,
      user_id: data.user_id,
      parent_id: ticketId,
      type: 'answer',
    };
    ticketService
      .create(postData)
      .then(() => {
        toast.success(t('successfully.created'));
        setTicketId(null);
        fetchTickets();
      })
      .finally(() => setLoading(false));
  };

  function fetchTicket() {
    setIsLoading(true);
    ticketService
      .getById(ticketId)
      .then(({ data }) => setData(data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  return (
    <Modal
      visible={!!ticketId}
      title={t('ask.for.question')}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          form='ticket-form'
          htmlType='submit'
          loading={loading}
        >
          {t('submit')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      {isloading ? (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin />
        </div>
      ) : (
        <Form
          id='ticket-form'
          name='translation'
          layout='vertical'
          onFinish={onFinish}
          form={form}
        >
          <Descriptions title={t('question')} bordered>
            <Descriptions.Item label={t('subject')} span={4}>
              {data?.subject}
            </Descriptions.Item>
            <Descriptions.Item label={t('content')} span={4}>
              {data?.content}
            </Descriptions.Item>
            <Descriptions.Item label={t('answer')} span={4}>
              <Form.Item
                name='subject'
                label={t('subject')}
                rules={[{ required: true, message: '' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='content'
                label={t('content')}
                rules={[{ required: true, message: '' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </Descriptions.Item>
          </Descriptions>
        </Form>
      )}
    </Modal>
  );
}
