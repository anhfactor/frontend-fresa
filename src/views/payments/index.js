import React, { useContext, useEffect, useState } from 'react';
import { Table, Switch, Space, Button } from 'antd';
import { Context } from '../../context/context';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../redux/slices/payment';
import { disableRefetch } from '../../redux/slices/menu';
import paymentService from '../../services/payment';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';
import PaymentEditModal from './paymentEditModal';

export default function Payments() {
  const { t } = useTranslation();
  const [id, setId] = useState(null);
  const [modal, setModal] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const { payments, loading } = useSelector(
    (state) => state.payment,
    shallowEqual
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [columns, setColumns] = useState([
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
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
      key: 'options',
      render: (options, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => setModal(row)}
            disabled={row.tag === 'wallet' || row.tag === 'cash'}
          />
        </Space>
      ),
    },
  ]);

  function setActivePayments() {
    setLoadingBtn(true);
    paymentService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        setId(null);
        dispatch(fetchPayments());
      })
      .finally(() => setLoadingBtn(false));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchPayments());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer headerTitle={t('payments')}>
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={payments}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
      />
      <CustomModal
        click={setActivePayments}
        text={t('set.active.payment')}
        loading={loadingBtn}
      />
      {modal && (
        <PaymentEditModal modal={modal} handleCancel={() => setModal(null)} />
      )}
    </GlobalContainer>
  );
}
