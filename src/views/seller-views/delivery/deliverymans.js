import React, { useEffect, useState } from 'react';
import { Card, Table } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import { fetchSellerDeliverymans } from '../../../redux/slices/deliveryman';
import useDidUpdate from '../../../helpers/useDidUpdate';
import formatSortType from '../../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import FilterColumns from '../../../components/filter-column';

export default function SellerDeliverymans() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('name'),
      is_show: true,
      dataIndex: 'firstname',
      key: 'firstname',
      render: (firstname, row) => (
        <div>
          {firstname} {row.lastname}
        </div>
      ),
    },
    {
      title: t('phone'),
      is_show: true,
      dataIndex: 'phone',
      key: 'phone',
    },
  ]);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { deliverymans, meta, loading, params } = useSelector(
    (state) => state.deliveryman,
    shallowEqual
  );

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerDeliverymans());
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
    dispatch(fetchSellerDeliverymans(paramsData));
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
      title={t('deliverymans')}
      extra={<FilterColumns setColumns={setColumns} columns={columns} />}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={deliverymans}
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
    </Card>
  );
}
