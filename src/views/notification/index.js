import React, { useContext, useEffect, useState } from 'react';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Switch, Table, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { fetchNotifications } from '../../redux/slices/notification';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import blogService from '../../services/blog';
import { useTranslation } from 'react-i18next';
import FilterColumns from '../../components/filter-column';
import DeleteButton from '../../components/delete-button';

export default function Notifications() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('published.at'),
      is_show: true,
      dataIndex: 'published_at',
      key: 'published_at',
      render: (published_at) => published_at || 'not published',
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
            <Tooltip title={t('publish')}>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={() => {
                  setId(row.uuid);
                  setIsDelete(false);
                  setIsPublish(true);
                  setIsModalVisible(true);
                }}
              />
            </Tooltip>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRows([row.id]);
                setIsDelete(true);
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
        url: `notification/${row.uuid}`,
        id: 'notification_edit',
        name: t('edit.notification'),
      })
    );
    navigate(`/notification/${row.uuid}`);
  };

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [isPublish, setIsPublish] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { notifications, meta, loading, params } = useSelector(
    (state) => state.notification,
    shallowEqual
  );
  const goToAddNotification = () => {
    dispatch(
      addMenu({
        id: 'notification/add',
        url: 'notification/add',
        name: t('add.notification'),
      })
    );
    navigate('/notification/add');
  };
  const notificationDelete = () => {
    setLoadingBtn(true);
    blogService
      .delete({ ids: selectedRows })
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchNotifications());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const notificationPublish = () => {
    setLoadingBtn(true);
    blogService
      .publish(id)
      .then(() => {
        toast.success(t('successfully.published'));
        dispatch(fetchNotifications());
        setIsModalVisible(false);
        setIsPublish(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const notificationSetActive = () => {
    setLoadingBtn(true);
    blogService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchNotifications());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchNotifications());
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
    dispatch(fetchNotifications(paramsData));
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
      setSelectedRows(selectedRowKeys);
    },
  };
  return (
    <Card
      title={t('notifications')}
      extra={
        <Space>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddNotification}
          >
            {t('add.notification')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={notificationDelete}
            disabled={Boolean(!selectedRows?.length)}
          >
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        columns={columns?.filter((items) => items.is_show)}
        dataSource={notifications}
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
      <CustomModal
        click={
          isPublish
            ? notificationPublish
            : isDelete
            ? notificationDelete
            : notificationSetActive
        }
        text={
          isPublish
            ? t('publish.notification')
            : isDelete
            ? t('delete.notification')
            : t('set.active.notification')
        }
        loading={loadingBtn}
      />
    </Card>
  );
}
