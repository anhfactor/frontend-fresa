import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Dropdown, Menu, Space, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import { fetchMessageSubscriber } from '../../redux/slices/messegeSubscriber';
import messageSubscriberService from '../../services/messageSubscriber';
import moment from 'moment';
import FilterColumns from '../../components/filter-column';
import CheckIsDemo from '../../components/check-is-demo';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';
import ResultModal from '../../components/result-modal';

const MessageSubciribed = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `message/subscriber/${row.id}`,
        id: 'subciribed_edit',
        name: t('edit.subscriber'),
      })
    );
    navigate(`/message/subscriber/${row.id}`);
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('send.to'),
      dataIndex: 'send_to',
      key: 'send_to',
      is_show: true,
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
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
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
              setIsModalVisible(true);
              setId([row.id]);
              setType(false);
              setText(true);
            }}
          />
        </Space>
      ),
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { subscribers, loading } = useSelector(
    (state) => state.messegeSubscriber,
    shallowEqual
  );

  const subscriberDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        }))
      ),
    };
    messageSubscriberService
      .delete(params)
      .then(() => {
        dispatch(fetchMessageSubscriber());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setText(null);
      });
  };

  const subscriberDropAll = () => {
    setLoadingBtn(true);
    messageSubscriberService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchMessageSubscriber());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const subscriberRestoreAll = () => {
    setLoadingBtn(true);
    messageSubscriberService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(fetchMessageSubscriber());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchMessageSubscriber());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchMessageSubscriber({ perPage: pageSize, page: current }));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'message.subscriber',
        url: `message/subscriber/add`,
        name: t('add.subciribed'),
      })
    );
    navigate(`/message/subscriber/add`);
  };

  const menu = (
    <Menu key={0}>
      <Menu.Item key={1}>
        <CheckIsDemo onClick={() => setRestore({ restore: true })}>
          <FaTrashRestoreAlt />
          {t('restore.all')}
        </CheckIsDemo>
      </Menu.Item>
      <Menu.Item key={2}>
        <CheckIsDemo onClick={() => setRestore({ delete: true })}>
          <MdDeleteSweep size={22} />
          {t('delete.all')}
        </CheckIsDemo>
      </Menu.Item>
      <Menu.Item key={3}>
        <CheckIsDemo onClick={allDelete}>
          <DeleteOutlined />
          {t('delete.selected')}
        </CheckIsDemo>
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      title={t('message.subscriber')}
      extra={
        <Space>
          <Button
            icon={<PlusCircleOutlined />}
            type='primary'
            onClick={goToAdd}
          >
            {t('add.subscriber')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: 1024 }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={subscribers}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
      <CustomModal
        click={subscriberDelete}
        text={
          type ? t('set.active.banner') : text ? t('delete') : t('all.delete')
        }
        loading={loadingBtn}
        setText={setId}
      />

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? subscriberRestoreAll : subscriberDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
};

export default MessageSubciribed;
