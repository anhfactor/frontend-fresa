import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Image, Row, Space, Switch, Table, Tag } from 'antd';
import { Context } from '../../context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import recipeCategory from '../../services/recipeCategory';
import { fetchRecipeCategories } from '../../redux/slices/recipeCategory';
import { useTranslation } from 'react-i18next';
import getImage from '../../helpers/getImage';
import DeleteButton from '../../components/delete-button';
import FilterColumns from '../../components/filter-column';

export default function RecipeCategories() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `recipe-category/${row.id}`,
        id: 'recipe-category_edit',
        name: t('edit.recipe.category'),
      })
    );
    navigate(`/recipe-category/${row.id}`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'image',
      key: 'image',
      render: (image) => {
        return (
          <Image
            src={getImage(image)}
            alt='img_gallery'
            width={100}
            className='rounded'
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.id);
              setType(true);
            }}
            checked={Boolean(status)}
          />
        );
      },
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
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRows([row.id]);
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
  const [id, setId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { recipeCategories, meta, loading } = useSelector(
    (state) => state.recipeCategory,
    shallowEqual
  );
  const goToAddRecipeCategory = () => {
    dispatch(
      addMenu({
        id: 'recipe-category/add',
        url: 'recipe-category/add',
        name: t('add.category'),
      })
    );
    navigate('/recipe-category/add');
  };
  const recipeCategoryDelete = () => {
    setLoadingBtn(true);
    recipeCategory
      .delete({ ids: selectedRows })
      .then(() => {
        dispatch(fetchRecipeCategories({}));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    recipeCategory
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchRecipeCategories());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchRecipeCategories({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchRecipeCategories({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
    },
  };
  return (
    <Card title={t('recipe.categories')}>
      <Row gutter={24} className='mb-2'>
        <Col span={24} className='d-flex justify-content-end'>
          <Space>
            <Button
              type='primary'
              icon={<PlusCircleOutlined />}
              onClick={goToAddRecipeCategory}
            >
              {t('add.recipe.category')}
            </Button>
            <DeleteButton
              onClick={recipeCategoryDelete}
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
        dataSource={recipeCategories}
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
        click={type ? handleActive : recipeCategoryDelete}
        text={
          type ? t('set.active.recipe.category') : t('delete.recipe.category')
        }
        loading={loadingBtn}
      />
    </Card>
  );
}
