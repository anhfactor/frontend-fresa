import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Table, Tag } from 'antd';
import { toast } from 'react-toastify';
import '../../assets/scss/components/brand.scss';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import GlobalContainer from '../../components/global-container';
import { fetchGroups } from '../../redux/slices/group';
import groupService from '../../services/group';
import DeleteButton from '../../components/delete-button';
import FilterColumns from '../../components/filter-column';

const Groups = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      render: (data, row) => row.translation?.title,
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status === 1 ? (
          <Tag color='cyan'>{t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
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
              onClick={() => goToEdit(row.id)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRows([row.id]);
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
        id: `group-edit`,
        url: `groups/${row}`,
        name: t('edit.group'),
      })
    );
    navigate(`/group/${row}`);
  };

  const { setIsModalVisible } = useContext(Context);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { groups, meta, loading } = useSelector(
    (state) => state.group,
    shallowEqual
  );
  const goToAddGroup = () => {
    dispatch(
      addMenu({
        id: 'groups/add',
        url: 'groups/add',
        name: t('add.groups'),
      })
    );
    navigate('/groups/add');
  };
  const brandDelete = () => {
    setLoadingBtn(true);
    groupService
      .delete({ ids: selectedRows })
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchGroups({ page: 1, perPage: 10 }));
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchGroups());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchGroups({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
    },
  };
  return (
    <Card title={t('groups')} navLInkTo={'/groups/add'}>
      <Row gutter={24} className='mb-2'>
        <Col span={24} className='d-flex justify-content-end'>
          <Space>
            <Button
              type='primary'
              icon={<PlusCircleOutlined />}
              onClick={goToAddGroup}
            >
              {t('add.group')}
            </Button>
            <DeleteButton
              onClick={brandDelete}
              type='danger'
              disabled={Boolean(!selectedRows?.length)}
            >
              {t('delete.all')}
            </DeleteButton>
            <FilterColumns setColumns={setColumns} columns={columns} />
          </Space>
        </Col>
      </Row>
      <Table
        rowSelection={rowSelection}
        columns={columns?.filter((items) => items.is_show)}
        dataSource={groups}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={brandDelete}
        text={t('delete.group')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Groups;
