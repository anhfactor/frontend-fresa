import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Image, Space, Table } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import getImage from '../../helpers/getImage';
import reviewService from '../../services/review';
import { fetchProductReviews } from '../../redux/slices/productReview';
import ProductReviewShowModal from './productReviewShow';
import FilterColumns from '../../components/filter-column';
import DeleteButton from '../../components/delete-button';

export default function ProductReviews() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('user'),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.firstname + ' ' + user?.lastname,
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      key: 'img',
      render: (img) => (
        <Image
          width={150}
          height={100}
          src={getImage(img)}
          placeholder
          className='rounded'
          style={{ objectFit: 'contain' }}
        />
      ),
    },
    {
      title: t('rating'),
      is_show: true,
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
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
              icon={<EyeOutlined />}
              onClick={() => setShow(row.id)}
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
  const { setIsModalVisible } = useContext(Context);
  const [show, setShow] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading, params } = useSelector(
    (state) => state.productReview,
    shallowEqual
  );
  const reviewDelete = () => {
    setLoadingBtn(true);
    reviewService
      .delete({ ids: selectedRows })
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchProductReviews());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };
  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchProductReviews());
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
    dispatch(fetchProductReviews(paramsData));
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
      title={t('product.reviews')}
      extra={
        <Space>
          <DeleteButton
            onClick={reviewDelete}
            type='danger'
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
        dataSource={reviews}
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
        click={reviewDelete}
        text={t('delete.review')}
        loading={loadingBtn}
      />
      {show && (
        <ProductReviewShowModal id={show} handleCancel={() => setShow(null)} />
      )}
    </Card>
  );
}
