import React, { useContext, useEffect, useState } from 'react';
import '../../../assets/scss/components/product-categories.scss';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Image, Card, Space, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url, IMG_URL } from '../../../configs/app-global';
import { Context } from '../../../context/context';
import CustomModal from '../../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import productService from '../../../services/seller/product';
import { fetchSellerProducts } from '../../../redux/slices/product';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../../helpers/formatSortType';
import useDidUpdate from '../../../helpers/useDidUpdate';
import SearchInput from '../../../components/search-input';
import { DebounceSelect } from '../../../components/search';
import brandService from '../../../services/rest/brand';
import categoryService from '../../../services/rest/category';
import SelectProduct from './select-product';
import DeleteButton from '../../../components/delete-button';
import FilterColumns from '../../../components/filter-column';

const ProductCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uuid, setUUID] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const { products, meta, loading, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'product-edit',
        url: `seller/product/edit/${row}`,
        name: t('edit.product'),
      })
    );
    navigate(`/seller/product/edit/${row}`);
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'seller-product-import',
        url: `seller/product/import`,
        name: t('product.import'),
      })
    );
    navigate(`/seller/product/import`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
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
      is_show: true,
      dataIndex: 'name',
    },
    {
      title: t('category'),
      is_show: true,
      dataIndex: 'category_name',
    },
    {
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setUUID(row.uuid);
              setIsDelete(false);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row.id)}
            />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setUUID(row.id);
                setIsDelete(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

  const productDelete = () => {
    setLoadingBtn(true);
    productService
      .delete({ ids: [uuid] })
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };
  const allProductDelete = () => {
    setLoadingBtn(true);
    productService
      .deleteAll({ ids: selectedRowKeys })
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(uuid)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchSellerProducts(params));
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
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchSellerProducts(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    if (activeMenu.refetch) {
      const data = activeMenu.data;
      const paramsData = {
        perPage: data?.perPage,
        page: data?.page,
      };
      dispatch(fetchSellerProducts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const excelExport = () => {
    setDownloading(true);
    productService
      .export()
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };

  async function fetchBrands(search) {
    const params = {
      search,
    };
    return brandService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.brand.title,
        value: item.brand.id,
      }))
    );
  }

  async function fetchCategories(search) {
    const params = {
      search,
    };
    return categoryService.getChild(params).then(({ data }) =>
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

  const showModal = () => setModalVisible(true);
  const handleCancel = () => setModalVisible(false);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <Card
      title={t('products')}
      extra={
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
          <Button type='primary' onClick={showModal}>
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
          <Button onClick={excelExport} loading={downloading}>
            {t('export')}
          </Button>
          <Button onClick={goToImport}>{t('import')}</Button>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((items) => items.is_show)}
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
      <SelectProduct isModalOpen={modalVisible} handleCancel={handleCancel} />
    </Card>
  );
};

export default ProductCategories;
