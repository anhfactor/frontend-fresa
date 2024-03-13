import React, { useContext, useEffect, useState } from 'react';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Image, Space, Switch, Table, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { fetchBlogs } from '../../redux/slices/blog';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import blogService from '../../services/blog';
import getImage from '../../helpers/getImage';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import FilterColumns from '../../components/filter-column';

export default function Blogs() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      render: (img) => {
        return (
          <Image
            width={150}
            height={100}
            src={getImage(img)}
            placeholder
            className='rounded'
            style={{ objectFit: 'contain' }}
          />
        );
      },
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
            setIsPublish(false);
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
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRows([row.id]);
                setIsDelete(true);
                setIsPublish(false);
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
        url: `blog/${row.uuid}`,
        id: 'blog_edit',
        name: t('edit.blog'),
      })
    );
    navigate(`/blog/${row.uuid}`);
  };
  const goToImport = (row) => {
    dispatch(
      addMenu({
        url: `blog/import`,
        id: 'blog_import',
        name: t('import.blog'),
      })
    );
    navigate(`/blog/import`);
  };
  const goToAddBlog = () => {
    dispatch(
      addMenu({
        id: 'blog/add',
        url: 'blog/add',
        name: t('add.blog'),
      })
    );
    navigate('/blog/add');
  };
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [isPublish, setIsPublish] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { blogs, meta, loading, params } = useSelector(
    (state) => state.blog,
    shallowEqual
  );

  const blogDelete = () => {
    setLoadingBtn(true);
    blogService
      .delete({ ids: selectedRows })
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchBlogs());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const blogSetActive = () => {
    setLoadingBtn(true);
    blogService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchBlogs());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const blogPublish = () => {
    setLoadingBtn(true);
    blogService
      .publish(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchBlogs());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBlogs());
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
    dispatch(fetchBlogs(paramsData));
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
      title={t('blogs')}
      extra={
        <Space>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddBlog}
          >
            {t('add.blog')}
          </Button>
          {/* <Button
            type='primary'
            icon={<CloudUploadOutlined />}
            onClick={goToImport}
          >
            {t('import')}
          </Button> */}
          <DeleteButton
            type='danger'
            onClick={blogDelete}
            disabled={Boolean(!selectedRows.length)}
          >
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={blogs}
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
        click={isPublish ? blogPublish : isDelete ? blogDelete : blogSetActive}
        text={
          isPublish
            ? t('publish.blog')
            : isDelete
            ? t('delete.blog')
            : t('set.active.blog')
        }
        loading={loadingBtn}
      />
    </Card>
  );
}
