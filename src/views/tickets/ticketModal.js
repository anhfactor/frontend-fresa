import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Form, List, Modal, Select, Spin } from 'antd';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticket';
import { useTranslation } from 'react-i18next';

export default function TicketModal({ ticketId, setTicketId, fetchTickets }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [form] = Form.useForm();
  const [statuses, setStatuses] = useState([]);

  const handleOk = () => {
    console.log('ok');
  };

  const handleCancel = () => {
    setTicketId(null);
  };

  const onFinish = (values) => {
    setLoading(true);
    const params = {
      ...values,
    };
    ticketService
      .setStatus(ticketId, params)
      .then(() => {
        toast.success(t('successfully.updated'));
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

  function fetchTicketStatuses() {
    ticketService.getStatus().then(({ data }) => setStatuses(data));
  }

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchTicketStatuses();
    }
  }, [ticketId]);

  return (
    <Modal
      visible={!!ticketId}
      title={t('update.status')}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          form='ticket-form'
          htmlType='submit'
          loading={loading}
        >
          {t('save')}
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
          initialValues={{ ...data }}
        >
          <Descriptions title={t('ticket')} bordered>
            <Descriptions.Item label={t('subject')} span={4}>
              {data?.subject}
            </Descriptions.Item>
            <Descriptions.Item label={t('content')} span={4}>
              {data?.content}
            </Descriptions.Item>
            <Descriptions.Item label={t('answer')} span={4}>
              <List
                itemLayout='horizontal'
                dataSource={data?.children}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.subject}
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          </Descriptions>
          <Form.Item
            name='status'
            label={t('status')}
            rules={[{ required: true, message: '' }]}
            className='mt-4'
          >
            <Select>
              {statuses.map((item) => (
                <Select.Option value={item}>{t(item)}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
