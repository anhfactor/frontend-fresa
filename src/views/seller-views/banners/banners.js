import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Image, Space, Switch, Table } from 'antd';
import { IMG_URL } from '../../../configs/app-global';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import bannerService from '../../../services/seller/banner';
import { fetchSellerBanners } from '../../../redux/slices/banner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../../components/delete-button';
import FilterColumns from '../../../components/filter-column';

const SellerBanners = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { banners, meta, loading } = useSelector(
    (state) => state.banner,
    shallowEqual
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      key: 'img',
      render: (img) => {
        return (
          <Image
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
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
      title: t('active'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            key={row.id + active}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType(true);
            }}
            checked={active}
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
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
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
              setSelectedRows([row]);
              setType(false);
            }}
          />
        </Space>
      ),
    },
  ]);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/banner/${row.id}`,
        id: 'banner_edit',
        name: t('edit.banner'),
      })
    );
    navigate(`/seller/banner/${row.id}`);
  };
  const goToAdd = () => {
    dispatch(
      addMenu({
        url: `/seller/banner/add`,
        id: 'banner_add',
        name: t('add.banner'),
      })
    );
    navigate(`/seller/banner/add`);
  };
  const bannerDelete = () => {
    setLoadingBtn(true);
    const ids = selectedRows?.map((item) => item.id);
    bannerService
      .delete({ ids })
      .then(() => {
        dispatch(fetchSellerBanners());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    bannerService
      .setActive(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchSellerBanners());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerBanners());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchSellerBanners({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };
  return (
    <Card
      title={t('banners')}
      extra={
        <Space>
          <Button
            size='small'
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
          >
            {t('add.banner')}
          </Button>
          <DeleteButton
            type='danger'
            onClick={bannerDelete}
            disabled={Boolean(!selectedRows?.length)}
          >
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={banners}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
        rowSelection={rowSelection}
      />
      <CustomModal
        click={type ? handleActive : bannerDelete}
        text={type ? t('set.active.banner') : t('delete.banner')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default SellerBanners;
