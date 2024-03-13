import React, { useEffect, useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import GlobalContainer from '../../../components/global-container';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../../helpers/formatSortType';
import useDidUpdate from '../../../helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import { fetchSellerClients } from '../../../redux/slices/client';

export default function SellerClients() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta, params } = useSelector(
    (state) => state.client,
    shallowEqual
  );

  const [uuid, setUuid] = useState(null);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('firstname'),
      is_show: true,
      dataIndex: 'firstname',
      key: 'firstname',
    },
    {
      title: t('lastname'),
      is_show: true,
      dataIndex: 'lastname',
      key: 'lastname',
    },
    {
      title: t('email'),
      is_show: true,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('role'),
      is_show: true,
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'options',
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setUuid(row.uuid)} />
          </Space>
        );
      },
    },
  ]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerClients());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      sort: data?.sort,
      column: data?.column,
      perPage: data.perPage,
      page: data.page,
    };
    dispatch(fetchSellerClients(paramsData));
  }, [activeMenu.data]);

  return (
    <GlobalContainer
      headerTitle={t('clients')}
      navLInkTo={'/seller/user/add'}
      buttonTitle={t('client.add')}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={clients}
        loading={loading}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
      />

      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
    </GlobalContainer>
  );
}
