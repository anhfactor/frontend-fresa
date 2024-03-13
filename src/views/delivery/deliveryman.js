import React, { useContext, useEffect, useState } from 'react';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Space, Switch, Table } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { fetchDeliverymans } from '../../redux/slices/deliveryman';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import userService from '../../services/user';
import { useTranslation } from 'react-i18next';
import DeliverymanModal from './deliveryman-modal';
import FilterColumns from '../../components/filter-column';

export default function Deliverymans() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row.uuid}`,
        id: 'user_edit',
        name: t('edit.user'),
      })
    );
    navigate(`/user/${row.uuid}`);
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
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => (
        <Switch
          checked={active}
          onChange={() => {
            setId(row.uuid);
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
          </Space>
        );
      },
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [visibility, setVisiblity] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { deliverymans, meta, loading, params } = useSelector(
    (state) => state.deliveryman,
    shallowEqual
  );

  const userDelete = () => {
    setLoadingBtn(true);
    userService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchDeliverymans());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const userSetActive = () => {
    setLoadingBtn(true);
    userService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchDeliverymans());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchDeliverymans());
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
    dispatch(fetchDeliverymans(paramsData));
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
      extra={
        <Space>
          <Button
            icon={<PlusCircleOutlined />}
            type='primary'
            onClick={() => setVisiblity(true)}
          >
            {t('add.deliveryman')}
          </Button>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
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
      <DeliverymanModal
        visibility={visibility}
        handleCancel={() => setVisiblity(false)}
      />
      <CustomModal
        click={isDelete ? userDelete : userSetActive}
        text={isDelete ? t('delete.user') : t('set.active.user')}
        loading={loadingBtn}
      />
    </Card>
  );
}
