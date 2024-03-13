import React, { useContext, useEffect, useState } from 'react';
import '../../../assets/scss/components/product-categories.scss';
import { Button, Space, Table } from 'antd';
import '../../../assets/scss/components/brand.scss';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CustomModal from '../../../components/modal';
import { toast } from 'react-toastify';
import { Context } from '../../../context/context';
import { fetchSellerPayments } from '../../../redux/slices/payment';
import paymentService from '../../../services/seller/payment';
import GlobalContainer from '../../../components/global-container';
import { useNavigate } from 'react-router-dom';

export default function SellerPayment() {
  const { t } = useTranslation();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const navigate = useNavigate();
  const { payments, loading } = useSelector(
    (state) => state.payment,
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
      dataIndex: 'title',
      key: 'title',
      render: (title, row) => {
        return <>{row.payment?.translation?.title}</>;
      },
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setId(row.id);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/payments/${row.id}`,
        id: 'payments_edit',
        name: t('edit.payments'),
      })
    );
    navigate(`/seller/payments/${row.id}`);
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerPayments());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchSellerPayments({ perPage: pageSize, page: current }));
  };

  const paymentDelete = () => {
    setLoadingBtn(true);
    paymentService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerPayments());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <GlobalContainer
      headerTitle={t('payment')}
      navLInkTo={'/seller/payments/add'}
      buttonTitle={t('add.payment')}
      columns={columns}
      setColumns={setColumns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={payments}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={paymentDelete}
        text={t('delete.payment')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
