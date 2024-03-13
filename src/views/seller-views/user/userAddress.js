import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import UserAddressModal from './userAddressModal';

export default function UserAddress({ data }) {
  const { t } = useTranslation();
  const [uuid, setUuid] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div className='px-2'>
      <div className='d-flex justify-content-end'>
        <Button
          type='primary'
          icon={<PlusCircleOutlined />}
          onClick={() => setUuid(data.uuid)}
        >
          {t('add.address')}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data.addresses}
        pagination={false}
        rowKey={(record) => record.id}
      />
      {uuid ? (
        <UserAddressModal uuid={uuid} handleCancel={() => setUuid(false)} />
      ) : (
        ''
      )}
    </div>
  );
}
