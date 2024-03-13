import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchBranch } from '../../../redux/slices/branch';
import branchService from '../../../services/seller/branch';
import DeleteButton from '../../../components/delete-button';
import FilterColumns from '../../../components/filter-column';

const SellerBranch = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { branches, meta, loading } = useSelector(
    (state) => state.branch,
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
      title: t('title'),
      is_show: true,
      dataIndex: 'title',
      key: 'title',
      render: (title, row) => {
        return <>{row?.translation?.title}</>;
      },
    },
    {
      title: t('address'),
      is_show: true,
      dataIndex: 'address',
      key: 'address',
      render: (title, row) => {
        return <>{row?.translation?.address}</>;
      },
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
              setId(row.id);
            }}
          />
        </Space>
      ),
    },
  ]);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/branch/${row.id}`,
        id: 'branch_edit',
        name: t('edit.branch'),
      })
    );
    navigate(`/seller/branch/${row.id}`);
  };
  const goToAdd = () => {
    dispatch(
      addMenu({
        url: `/seller/branch/add`,
        id: 'branch_add',
        name: t('add.branch'),
      })
    );
    navigate(`/seller/branch/add`);
  };
  const branchDelete = () => {
    setLoadingBtn(true);
    const ids = selectedRows?.map((item) => item.id);
    branchService
      .delete({ ids })
      .then(() => {
        dispatch(fetchBranch());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBranch());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchBranch({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };
  return (
    <Card
      title={t('branch')}
      extra={
        <Space>
          <Button
            size='small'
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
          >
            {t('add.branch')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={branchDelete}
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
        dataSource={branches}
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
        click={branchDelete}
        text={'delete.branch'}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default SellerBranch;
