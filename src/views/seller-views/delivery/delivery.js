import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Button, Switch, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import GlobalContainer from '../../../components/global-container';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import { fetchSellerDeliveries } from '../../../redux/slices/delivery';
import { useTranslation } from 'react-i18next';
import deliveryService from '../../../services/seller/delivery';
import { toast } from 'react-toastify';

export default function SellerDelivery() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/delivery/${row.id}`,
        id: 'delivery_edit',
        name: t('edit.delivery'),
      })
    );
    navigate(`/seller/delivery/${row.id}`);
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
      title: t('price'),
      is_show: true,
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => (
        <Switch checked={active} onChange={() => deliveryActive(row.id)} />
      ),
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
      dispatch(fetchSellerDeliveries());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  function deliveryActive(id) {
    setLoadingBtn(true);
    deliveryService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchSellerDeliveries());
      })
      .finally(() => setLoadingBtn(false));
  }

  return (
    <GlobalContainer
      headerTitle={t('delivery')}
      navLInkTo={'/seller/deliveries/add'}
      buttonTitle={t('add.delivery')}
      setColumns={setColumns}
      columns={columns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={deliveries}
        loading={loading || loadingBtn}
        rowKey={(record) => record.id}
      />
    </GlobalContainer>
  );
}
