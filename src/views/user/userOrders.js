import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addMenu } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { clearOrder } from '../../redux/slices/order';
import numberToPrice from '../../helpers/numberToPrice';
import orderService from '../../services/order';

export default function UserOrders({ data }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${row.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      })
    );
    navigate(`/order/${row.id}`);
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/order/details/${row.id}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (id, row) => (
        <div>
          {id}
          {row.status === 'new' && (
            <Badge
              count={t('new')}
              style={{
                backgroundColor: '#52c41a',
                position: 'absolute',
                top: -30,
                right: -30,
                display: 'block',
                width: 41,
                zIndex: 10,
              }}
            />
          )}
        </div>
      ),
    },
    {
      title: t('client'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          {user.firstname} {user.lastname}
        </div>
      ),
    },
    {
      title: t('number.of.products'),
      dataIndex: 'order_details_count',
      key: 'order_details_count',
      render: (order_details_count) => (
        <div className='text-lowercase'>
          {order_details_count} {t('products')}
        </div>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      render: (price, row) => numberToPrice(price, row.currency?.symbol),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('options'),
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => goToShow(row)} />
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
          </Space>
        );
      },
    },
  ];

  function onChangePagination(pagination) {
    const { pageSize: perPage, current: page } = pagination;
    setPage(page);
    setPerPage(perPage);
  }

  function fetchUserOrders() {
    setLoading(true);
    const params = {
      user_id: data.id,
    };
    orderService
      .getAll(params)
      .then((res) => {
        setList(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUserOrders();
  }, []);

  console.log('List', list);
  return (
    <Table
      columns={columns}
      dataSource={list?.orders || []}
      loading={loading}
      pagination={{
        pageSize: perPage,
        page,
        total,
      }}
      rowKey={(record) => record.id}
      onChange={onChangePagination}
    />
  );
}
