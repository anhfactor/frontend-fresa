import React, { useContext, useEffect, useState } from 'react';
import {
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../helpers/formatSortType';
import useDidUpdate from '../../helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';
import { fetchClients } from '../../redux/slices/client';
import SearchInput from '../../components/search-input';
import FilterColumns from '../../components/filter-column';
import DeleteButton from 'components/delete-button';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import userService from 'services/user';
import { toast } from 'react-toastify';

const User = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta, params } = useSelector(
    (state) => state.client,
    shallowEqual
  );

  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
  const deleteUser = () => {
    setLoadingBtn(true);
    const data = activeMenu.data;
    userService
      .delete({ ids: id })
      .then(() => {
        dispatch(fetchClients({ perPage: data?.perPage, page: data?.page }));
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
      })
      .finally(() => setLoadingBtn(false));
  };

  const allUserDelete = () => {
    setLoadingBtn(true);
    const data = activeMenu.data;
    userService
      .delete({ ids: selectedRowKeys })
      .then(() => {
        dispatch(fetchClients({ perPage: data?.perPage, page: data?.page }));
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
      })
      .finally(() => setLoadingBtn(false));
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
      title: t('firstname'),
      is_show: true,
      dataIndex: 'firstname',
      key: 'firstname',
    },
    {
      title: t('lastname'),
      is_show: true,
      dataIndex: 'lastname',
      key: 'lastname',
    },
    {
      title: t('email'),
      is_show: true,
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('role'),
      is_show: true,
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'options',
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setUuid(row.uuid)} />
            <Tooltip title={t('change.user.role')}>
              <Button onClick={() => setUserRole(row)} icon={<FaUserCog />} />
            </Tooltip>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <DeleteButton
              onClick={() => {
                setId([row.id]);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchClients());
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
      search: data?.search,
    };
    dispatch(fetchClients(paramsData));
  }, [activeMenu.data]);

  const goToAddClient = () => {
    dispatch(
      addMenu({
        id: 'user-add',
        url: 'user/add',
        name: t('add.client'),
      })
    );
    navigate('/user/add');
  };

  const handleFilter = (item, name) => {
    const data = activeMenu.data;
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, [name]: item },
      })
    );
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Card
      title={t('clients')}
      extra={
        <Space>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddClient}
          >
            {t('add.client')}
          </Button>
          <Button
            className=''
            type='danger'
            onClick={allUserDelete}
            disabled={Boolean(!selectedRowKeys?.length)}
          >
            {t('delete.all')}
          </Button>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        columns={columns?.filter((items) => items.is_show)}
        dataSource={clients}
        loading={loading}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
      />
      <CustomModal
        click={deleteUser}
        text={'sure.to.delete'}
        loading={loadingBtn}
        setText={setId}
      />
      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}
    </Card>
  );
};

export default User;
