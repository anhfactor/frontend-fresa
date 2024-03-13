import React, { useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import GlobalContainer from '../../components/global-container';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { fetchDeliveries } from '../../redux/slices/delivery';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Delivery() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `delivery/${row.id}`,
        id: 'delivery_edit',
        name: t('edit.delivery'),
      })
    );
    navigate(`/delivery/${row.id}`);
  };
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { deliveries, loading } = useSelector(
    (state) => state.delivery,
    shallowEqual
  );
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('type'),
      is_show: true,
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('shop.id'),
      is_show: true,
      dataIndex: 'shop_id',
      key: 'shop_id',
    },
    {
      title: t('price'),
      is_show: true,
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      render: (data, row) => (
        <Button
          type='primary'
          icon={<EditOutlined />}
          onClick={() => goToEdit(row)}
        />
      ),
    },
  ]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchDeliveries());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer
      headerTitle={t('deliveries')}
      navLInkTo={'/deliveries/add'}
      buttonTitle={t('add.delivery')}
      columns={columns}
      setColumns={setColumns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={deliveries}
        loading={loading}
        rowKey={(record) => record.id}
      />
    </GlobalContainer>
  );
}
