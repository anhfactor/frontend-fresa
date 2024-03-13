import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Image, Row, Space, Table, Tag } from 'antd';
import { export_url, IMG_URL } from '../../configs/app-global';
import { Context } from '../../context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import FilterColumns from '../../components/filter-column';

const Categories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'category/add',
        name: t('add.category'),
      })
    );
    navigate('/category/add');
  };

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `category/${row.uuid}`,
        id: 'category_edit',
        name: t('edit.category'),
      })
    );
    navigate(`/category/${row.uuid}`);
  };
  const goToClone = (row) => {
    dispatch(
      addMenu({
        url: `category-clone/${row.uuid}`,
        id: 'category_clone',
        name: t('clone.category'),
      })
    );
    navigate(`/category-clone/${row.uuid}`);
  };
  const goToImport = () => {
    dispatch(
      addMenu({
        url: `catalog/categories/import`,
        id: 'category_import',
        name: t('import.category'),
      })
    );
    navigate(`/catalog/categories/import`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('name'),
      is_show: true,
      dataIndex: 'name',
      width: '25%',
      key: 'name',
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => {
        return (
          <Image
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
            alt='img_gallery'
            width={100}
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active) =>
        active ? (
          <Tag color='cyan'> {t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
        ),
    },
    {
      title: t('child.categories'),
      is_show: true,
      dataIndex: 'children',
      key: 'children',
      render: (children) => children?.length,
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
      width: 220,
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button icon={<CopyOutlined />} onClick={() => goToClone(row)} />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRows([row]);
                setType(false);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const { setIsModalVisible } = useContext(Context);
  const [alias, setAlias] = useState(false);
  const [type, setType] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { categories, meta, loading } = useSelector(
    (state) => state.category,
    shallowEqual
  );

  const categoryDelete = () => {
    setLoadingBtn(true);
    const ids = selectedRows?.map((item) => item.id);
    categoryService
      .delete({ ids })
      .then(() => {
        dispatch(fetchCategories());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    categoryService
      .setActive(alias)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchCategories());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchCategories());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchCategories({ perPage: pageSize, page: current }));
  };

  const excelExport = () => {
    setDownloading(true);
    categoryService
      .export()
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  const filteredColumns = columns?.filter((items) => items.is_show);
  return (
    <Card
      title={t('categories')}
      extra={
        <Space>
          <Button onClick={excelExport} loading={downloading}>
            {t('export')}
          </Button>
          <Button onClick={goToImport}>{t('import')}</Button>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddCategory}
          >
            {t('add.category')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={categoryDelete}
            disabled={Boolean(!selectedRows?.length)}
          >
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={filteredColumns?.length ? rowSelection : null}
        columns={filteredColumns}
        dataSource={categories}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.key}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={type ? handleActive : categoryDelete}
        text={type ? t('set.active.category') : t('delete.category')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Categories;
