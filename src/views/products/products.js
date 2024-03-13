import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Image, Card, Space, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url, IMG_URL } from '../../configs/app-global';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import productService from '../../services/product';
import { fetchProducts } from '../../redux/slices/product';
import useDidUpdate from '../../helpers/useDidUpdate';
import { DebounceSelect } from '../../components/search';
import brandService from '../../services/brand';
import categoryService from '../../services/category';
import SearchInput from '../../components/search-input';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import FilterColumn from '../../components/filter-column';
import shopService from 'services/shop';

const ProductCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      is_show: true,
      render: (img) => {
        return (
          <Image
            width={100}
            src={IMG_URL + img}
            placeholder
            style={{ borderRadius: 4 }}
          />
        );
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
      is_show: true,
    },
    {
      title: t('category'),
      dataIndex: 'category_name',
      is_show: true,
    },
    {
      title: t('options'),
      dataIndex: 'options',
      is_show: true,
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row.uuid, !!row.gift)}
            />
            <Button
              type='success'
              icon={<CopyOutlined />}
              onClick={() => goToClone(row.uuid)}
            />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setUUID(row.uuid);
                setIsDelete(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const goToEdit = (row, isGift) => {
      if(isGift) {
          dispatch(
              addMenu({
                  id: `gift-card-edit`,
                  url: `gift-card/${row}`,
                  name: t('edit.gift.card'),
              })
          );
          navigate(`/gift-card/${row}`);
      } else {
          dispatch(
              addMenu({
                  id: `product-edit`,
                  url: `product/${row}`,
                  name: t('edit.product'),
              })
          );
          navigate(`/product/${row}`);
      }
  };
  const goToClone = (row) => {
    dispatch(
      addMenu({
        id: `product-clone`,
        url: `product-clone/${row}`,
        name: t('clone.product'),
      })
    );
    navigate(`/product-clone/${row}`);
  };
  const [uuid, setUUID] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { products, meta, loading, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );

  const productDelete = () => {
    setLoadingBtn(true);
    productService
      .delete(uuid)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };

  const allProductDelete = () => {
    setLoadingBtn(true);
    productService
      .deleteAll({ productIds: selectedRowKeys })
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(uuid)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchProducts(params));
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  function onChangePagination(pagination, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, perPage, page, column, sort },
      })
    );
  }

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      search: data?.search,
      brand_id: data?.brand?.value,
      category_id: data?.category?.value,
      shop_id: data?.shop?.value,
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchProducts(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    const data = activeMenu.data;
    const paramsData = {
      search: data?.search,
      brand_id: data?.brand?.value,
      category_id: data?.category?.value,
      shop_id: data?.shop?.value,
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    if (activeMenu.refetch) {
      dispatch(fetchProducts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'product-add',
        url: 'product/add',
        name: t('add.product'),
      })
    );
    navigate('/product/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'product-import',
        url: `catalog/product/import`,
        name: t('product.import'),
      })
    );
    navigate(`/catalog/product/import`);
  };

  async function fetchBrands(search) {
    return brandService.search(search).then(({ data }) =>
      data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  async function fetchCategories(search) {
    const params = { search };
    return categoryService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, [name]: item },
      })
    );
  };

  const excelExport = () => {
    setDownloading(true);
    productService
      .export({ shop_id: activeMenu.data?.shop?.value || null })
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  async function fetchShops(search) {
    const params = { search };
    return shopService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Card
      title={t('products')}
      extra={
        <Space>
          <DebounceSelect
            placeholder={t('select.shop')}
            fetchOptions={fetchShops}
            style={{ minWidth: 150 }}
            onChange={(shop) => handleFilter(shop, 'shop')}
            value={activeMenu.data?.shop}
          />
          <Button onClick={excelExport} loading={downloading}>
            {t('export')}
          </Button>
          <Button onClick={goToImport}>{t('import')}</Button>
          <FilterColumn columns={columns} setColumns={setColumns} />
        </Space>
      }
    >
      <Row gutter={24} className='mb-2'>
        <Col span={12}>
          <Space>
            <SearchInput
              placeholder={t('search')}
              handleChange={(search) => handleFilter(search, 'search')}
            />
            <DebounceSelect
              placeholder={t('select.category')}
              fetchOptions={fetchCategories}
              style={{ minWidth: 150 }}
              onChange={(category) => handleFilter(category, 'category')}
              value={activeMenu.data?.category}
            />
            <DebounceSelect
              placeholder={t('select.brand')}
              fetchOptions={fetchBrands}
              style={{ minWidth: 150 }}
              onChange={(brand) => handleFilter(brand, 'brand')}
              value={activeMenu.data?.brand}
            />
          </Space>
        </Col>
        <Col span={12} className='d-flex justify-content-end'>
          <Space>
            <Button type='primary' onClick={goToAddProduct}>
              {t('add.product')}
            </Button>
            <Button
              className=''
              type='danger'
              onClick={allProductDelete}
              disabled={Boolean(!selectedRowKeys?.length)}
            >
              {t('delete.all')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={products}
        pagination={{
          pageSize: params.perPage,
          page: activeMenu.data?.page || 1,
          total: meta.total,
          defaultCurrent: activeMenu.data?.page,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      />
      <CustomModal
        click={isDelete ? productDelete : handleActive}
        text={isDelete ? t('delete.product') : t('set.active.product')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default ProductCategories;
