import React, { useEffect, useState } from 'react';
import { Button, Table } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../helpers/numberToPrice';
import userService from '../../services/user';
import { PlusCircleOutlined } from '@ant-design/icons';
import UserWalletModal from './userWalletModal';

export default function WalletHistory({ data }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [walletModal, setWalletModal] = useState(false);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );

  const columns = [
    {
      title: t('created.by'),
      dataIndex: 'author',
      key: 'author',
      render: (author) => (
        <div>
          {author?.firstname} {author?.lastname}
        </div>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price, defaultCurrency?.symbol),
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    setPage(page);
    setPerPage(perPage);
  }

  function fetchWalletHistory() {
    setLoading(true);
    userService
      .walletHistory(data.uuid)
      .then((res) => {
        setList(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchWalletHistory();
  }, []);

  return (
    <div className='px-2'>
      <div className='d-flex justify-content-end'>
        <Button
          type='primary'
          icon={<PlusCircleOutlined />}
          onClick={() => setWalletModal(true)}
        >
          {`${t('wallet')}: ${numberToPrice(
            data?.wallet?.price,
            defaultCurrency.symbol
          )}`}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          pageSize: perPage,
          page,
          total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
      />
      {walletModal && (
        <UserWalletModal
          modal={walletModal}
          uuid={data.uuid}
          handleCancel={() => setWalletModal(false)}
        />
      )}
    </div>
  );
}
