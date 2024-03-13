import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Image, Space, Switch, Table } from 'antd';
import { toast } from 'react-toastify';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import discountService from '../../../services/seller/discount';
import { fetchDiscounts } from '../../../redux/slices/discount';
import useDidUpdate from '../../../helpers/useDidUpdate';
import formatSortType from '../../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';
import FilterColumns from '../../../components/filter-column';
import DeleteButton from '../../../components/delete-button';

export default function SellerDiscounts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `discount/${row.id}`,
        id: 'discount_edit',
        name: t('edit.discount'),
      })
    );
    navigate(`/discount/${row.id}`);
  };
  const goToAdd = (row) => {
    dispatch(
      addMenu({
        url: `/discount/add`,
        id: 'discount_add',
        name: t('add.discount'),
      })
    );
    navigate(`/discount/add`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => (
        <Image
          src={getImage(img)}
          alt={row.type}
          width={100}
          className='rounded'
          preview
          placeholder
        />
      ),
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
      title: t('start.date'),
      is_show: true,
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: t('end.date'),
      is_show: true,
      dataIndex: 'end',
      key: 'end',
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => (
        <Switch
          checked={active}
          onChange={() => {
            setId(row.id);
            setIsDelete(false);
            setIsModalVisible(true);
          }}
        />
      ),
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
                setSelectedRows([row]);
                setIsDelete(true);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { discounts, meta, loading, params } = useSelector(
    (state) => state.discount,
    shallowEqual
  );

  const discountDelete = () => {
    setLoadingBtn(true);
    const ids = selectedRows?.map((item) => item.id);
    discountService
      .delete({ ids })
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchDiscounts());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const discountSetActive = () => {
    setLoadingBtn(true);
    discountService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchDiscounts());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchDiscounts());
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
    dispatch(fetchDiscounts(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };
  return (
    <Card
      title={t('discounts')}
      extra={
        <Space>
          <Button
            size='small'
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
          >
            {t('add.discount')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={discountDelete}
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
        dataSource={discounts}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
        rowSelection={rowSelection}
      />
      <CustomModal
        click={isDelete ? discountDelete : discountSetActive}
        text={isDelete ? t('delete.discount') : t('set.active.discount')}
        loading={loadingBtn}
      />
    </Card>
  );
}
