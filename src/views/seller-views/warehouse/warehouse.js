import { Button, Card, Image, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import React, { useContext, useEffect, useState } from 'react';
import {addMenu, disableRefetch, setMenuData} from '../../../redux/slices/menu';
import { fetchWarehouse } from '../../../redux/slices/warehouse';
import { IMG_URL } from '../../../configs/app-global';
import {
  DeleteOutlined,
  EyeOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import DeleteButton from '../../../components/delete-button';
import { Context } from '../../../context/context';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../../../components/modal';
import warehouseService from '../../../services/seller/warehouse';
import { toast } from 'react-toastify';
import formatSortType from "../../../helpers/formatSortType";
import useDidUpdate from "../../../helpers/useDidUpdate";

function Warehouse() {
  const { t } = useTranslation();
  const { warehouse, loading, params, meta } = useSelector(
    (state) => state.warehouse
  );
  const { activeMenu } = useSelector((state) => state.menu);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [uuid, setUUID] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
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
      title: t('product.name'),
      is_show: true,
      dataIndex: 'productName',
    },
    {
      title: t('type'),
      is_show: true,
      dataIndex: 'type',
      render: (type) => {
        return type === 'income' ? (
          <Tag icon={<VerticalAlignBottomOutlined />} color='cyan'>
            {type}
          </Tag>
        ) : (
          <Tag icon={<VerticalAlignTopOutlined />} color='blue'>
            {type}
          </Tag>
        );
      },
    },
    {
      title: t('user'),
      is_show: true,
      dataIndex: 'username',
    },
    {
      title: t('options'),
      is_show: true,
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => goToEdit(row.id)} />
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setUUID(row.id);
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
        id: 'warehouse.detail',
        url: `seller/warehouse/${row}`,
        name: t('edit.warehouse'),
      })
    );
    navigate(`/seller/warehouse/${row}`);
  };

  const goToCreate = () => {
    const nextUrl = '/seller/warehouse/create';
    dispatch(
      addMenu({
        id: 'warehouse.create',
        url: nextUrl,
        name: t('create.warehouse'),
      })
    );
    navigate(nextUrl);
  };

  const warehouseDelete = async () => {
    setLoadingBtn(true);
    warehouseService
      .delete(uuid)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchWarehouse(params));
      })
      .catch((error) => console.error(error))
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
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchWarehouse(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    if (activeMenu.refetch) {
      const data = activeMenu.data;
      console.log();
      const paramsData = {
        perPage: data?.perPage || 10,
        page: data?.page,
      };
      dispatch(fetchWarehouse(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <Card
      title={t('warehouse')}
      extra={
        <Button onClick={goToCreate} type='primary'>
          {t('create')}
        </Button>
      }
    >
      <Table
        loading={loading}
        columns={columns?.filter((items) => items.is_show)}
        dataSource={warehouse}
        pagination={{
          pageSize: 10,
          page: activeMenu.data?.page || 1,
          total: meta.total,
          defaultCurrent: activeMenu.data?.page,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      ></Table>
      <CustomModal
        click={warehouseDelete}
        text={t('delete.warehouse')}
        loading={loadingBtn}
      />
    </Card>
  );
}

export default Warehouse;
