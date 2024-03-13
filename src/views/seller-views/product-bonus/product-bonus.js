import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Space, Switch, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import bonusService from '../../../services/seller/bonus';
import { fetchBonus } from '../../../redux/slices/product-bonus';
import moment from 'moment';
import DeleteButton from '../../../components/delete-button';
import FilterColumns from '../../../components/filter-column';

const ProductBonus = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { bonus, meta, loading } = useSelector(
    (state) => state.bonus,
    shallowEqual
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('bonus.product'),
      is_show: true,
      dataIndex: 'bonus_product',
      key: 'bonus_product',
      render: (bonus_product, row) => {
        return <>{row?.bonus_product?.product?.translation?.title}</>;
      },
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        return (
          <Switch
            key={row.id + status}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType(true);
            }}
            checked={status}
          />
        );
      },
    },
    {
      title: t('expired.at'),
      is_show: true,
      dataIndex: 'expired_at',
      key: 'expired_at',
      render: (expired_at) => (
        <div>
          {moment(new Date()).isBefore(expired_at) ? (
            <Tag color='blue'>{expired_at}</Tag>
          ) : (
            <Tag color='error'>{expired_at}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedRows([row]);
              setIsModalVisible(true);
              setType(false);
            }}
          />
        </Space>
      ),
    },
  ]);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/product-bonus/${row.id}`,
        id: 'bonus_edit',
        name: t('edit.bonus'),
      })
    );
    navigate(`/seller/product-bonus/${row.id}`);
  };
  const goToAdd = (row) => {
    dispatch(
      addMenu({
        url: `/seller/product-bonus/add`,
        id: 'bonus_add',
        name: t('add.bonus'),
      })
    );
    navigate(`/seller/product-bonus/add`);
  };

  const bannerDelete = () => {
    setLoadingBtn(true);
    const ids = selectedRows?.map((item) => item.id);
    bonusService
      .delete({ ids })
      .then(() => {
        dispatch(fetchBonus());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    bonusService
      .setActive(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchBonus());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBonus());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchBonus({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };
  return (
    <Card
      title={t('bonus')}
      extra={
        <Space>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAdd}
          >
            {t('add.bonus')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={bannerDelete}
            disabled={Boolean(!selectedRows?.length)}
          >
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={bonus}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
        rowSelection={rowSelection}
      />
      <CustomModal
        click={type ? handleActive : bannerDelete}
        text={type ? t('set.active.bonus') : t('delete.bonus')}
        loading={loadingBtn}
      />
    </Card>
    // <GlobalContainer
    //   headerTitle={}
    //   navLInkTo={''}
    //   buttonTitle={}
    //   setColumns={setColumns}
    //   columns={columns}
    // >

    // </GlobalContainer>
  );
};

export default ProductBonus;
