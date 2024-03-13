import React, { useEffect, useState } from 'react';
import { Card, Space, Table, Tag } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchSubscriber } from '../../redux/slices/subscriber';
import FilterColumns from '../../components/filter-column';

const Subciribed = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      is_show: true,
      render: (_, row) => {
        return <div>{row?.user?.firstname + ' ' + row?.user?.lastname}</div>;
      },
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      is_show: true,
      render: (_, row) => {
        return <div>{hideEmail(row.user?.email)}</div>;
      },
    },
    {
      title: t('status'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active) => {
        return (
          <Tag color={active === true ? 'blue' : 'red'}>
            {active === true ? t('subscriber') : t('not.subscriber')}
          </Tag>
        );
      },
    },
  ]);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { subscriber, meta, loading } = useSelector(
    (state) => state.subscriber,
    shallowEqual
  );

  let hideEmail = function (email) {
    return email?.replace(/(.{3})(.*)(?=@)/, function (gp2, gp3) {
      for (let i = 0; i < gp3.length; i++) {
        gp2 += '*';
      }
      return gp2;
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSubscriber());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchSubscriber({ perPage: pageSize, page: current }));
  };

  return (
    <Card
      title={t('subscriber')}
      extra={
        <Space>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: 1024 }}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={subscriber}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
    </Card>
  );
};

export default Subciribed;
