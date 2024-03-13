import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Dropdown, Menu, Space, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import FilterColumn from '../../components/filter-column';
import { fetchRefund } from '../../redux/slices/refund';
import refundService from '../../services/refund';
import CheckIsDemo from '../../components/check-is-demo';
import { FaTrashRestoreAlt } from 'react-icons/fa';
import { MdDeleteSweep } from 'react-icons/md';
import ResultModal from '../../components/result-modal';
import moment from 'moment';

const Refunds = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refund_delete } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `refund/details/${id}`,
        id: 'refund_details',
        name: t('refund.details'),
      })
    );
    navigate(`/refund/details/${id}`);
  };

  const [columns, setColumns] = useState([
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order.id',
      key: 'order.id',
      render: (shop, row) => <div>{row?.order_id}</div>,
    },
    {
      title: t('client'),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user, row) => (
        <div>
          {row.user?.firstname} {row.user?.lastname}
        </div>
      ),
    },
    {
      title: t('shop'),
      is_show: true,
      dataIndex: 'shop',
      key: 'shop',
      render: (shop, row) => <div>{row?.order?.shop?.translation?.title}</div>,
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (shop, row) => moment(row.created_at).format('LLL'),
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => goToShow(row.id)} />
            {refund_delete === '0' ? null : (
              <DeleteButton
                onClick={() => {
                  setId([row.id]);
                  setIsModalVisible(true);
                  setText(true);
                }}
              />
            )}
          </Space>
        );
      },
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { refund, meta, loading } = useSelector(
    (state) => state.refund,
    shallowEqual
  );

  const refundDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        }))
      ),
    };
    refundService
      .delete(params)
      .then(() => {
        dispatch(fetchRefund());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const refundDropAll = () => {
    setLoadingBtn(true);
    refundService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchRefund());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const refundRestoreAll = () => {
    setLoadingBtn(true);
    refundService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchRefund());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchRefund());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchRefund({ perPage: pageSize, page: current }));
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
  console.log(refund);
  return (
    <Card
      title={t('refunds')}
      extra={
        <Space>
          <FilterColumn columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Table
        scroll={{ x: 1024 }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={refund}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
      <CustomModal
        click={refundDelete}
        text={text ? t('delete') : t('all.delete')}
        loading={loadingBtn}
        setText={setId}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? refundRestoreAll : refundDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
};

export default Refunds;
