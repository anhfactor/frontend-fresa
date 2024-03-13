import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Table, Tag } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import { fetchPayoutRequests } from '../../redux/slices/payoutRequests';
import numberToPrice from '../../helpers/numberToPrice';
import { EditOutlined } from '@ant-design/icons';
import PayoutRequestModal from './payoutRequestModal';
import FilterColumns from '../../components/filter-column';

export default function PayoutRequests() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { payoutRequests, meta, loading, params } = useSelector(
    (state) => state.payoutRequests,
    shallowEqual
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const [modal, setModal] = useState(null);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('user'),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.firstname + ' ' + user?.lastname,
    },
    {
      title: t('price'),
      is_show: true,
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price, defaultCurrency.symbol),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div>
          {status === 'processed' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'rejected' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('note'),
      is_show: true,
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'uuid',
      key: 'uuid',
      render: (uuid, row) => (
        <Space>
          {row.status === 'processed' ? (
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => setModal(row)}
            />
          ) : (
            ''
          )}
        </Space>
      ),
    },
  ]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchPayoutRequests());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchPayoutRequests(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  return (
    <Card
      title={t('payout.requests')}
      extra={<FilterColumns setColumns={setColumns} columns={columns} />}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={payoutRequests}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      {modal && (
        <PayoutRequestModal data={modal} handleCancel={() => setModal(null)} />
      )}
    </Card>
  );
}
