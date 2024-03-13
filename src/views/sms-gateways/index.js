import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Switch, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import smsService from '../../services/smsGateways';
import SmsEditModal from './smsEditModal';
import { useTranslation } from 'react-i18next';
import TwilioModal from './twilioModal';
import FilterColumns from '../../components/filter-column';

export default function SmsGateways() {
  const { t } = useTranslation();
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const { setIsModalVisible } = useContext(Context);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
    },
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'title',
    },
    {
      title: t('from'),
      is_show: true,
      dataIndex: 'from',
    },
    {
      title: t('type'),
      is_show: true,
      dataIndex: 'type',
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.id);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'options',
      render: (data, row) => (
        <Button
          type='primary'
          icon={<EditOutlined />}
          onClick={() => setModal(row)}
        />
      ),
    },
  ]);

  function fetchSmsGateways() {
    setLoading(true);
    smsService
      .get()
      .then((res) => setData(res.data))
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchSmsGateways();
  }, []);

  const updateStatus = () => {
    setLoadingBtn(true);
    smsService
      .setActive(id)
      .then(() => {
        fetchSmsGateways();
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card
      title={t('sms.gateway')}
      extra={<FilterColumns setColumns={setColumns} columns={columns} />}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={false}
        loading={loading}
      />
      <CustomModal
        click={updateStatus}
        text={t('set.active.sms.gateway')}
        loading={loadingBtn}
      />
      {modal && modal.type === 'twilio' && (
        <TwilioModal
          modal={modal}
          handleCancel={() => setModal(null)}
          refetch={fetchSmsGateways}
        />
      )}
      {modal && modal.type !== 'twilio' && (
        <SmsEditModal
          modal={modal}
          handleCancel={() => setModal(null)}
          refetch={fetchSmsGateways}
        />
      )}
    </Card>
  );
}
