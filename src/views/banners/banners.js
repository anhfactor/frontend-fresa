import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Image, Row, Space, Switch, Table } from 'antd';
import { IMG_URL } from '../../configs/app-global';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import bannerService from '../../services/banner';
import { fetchBanners } from '../../redux/slices/banner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import FilterColumns from '../../components/filter-column';

const Banners = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
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
    // {
    //   title: t('active'),
    // is_show: true,
    //   dataIndex: 'active',
    //   key: 'active',
    //   render: (active, row) => {
    //     return (
    //       <Switch
    //         key={row.id + active}
    //         onChange={() => {
    //           setIsModalVisible(true);
    //           setActiveId(row.id);
    //           setType(true);
    //         }}
    //         checked={active}
    //       />
    //     );
    //   },
    // },
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
              setSelectedRows([row.id]);
              setType(false);
            }}
          />
        </Space>
      ),
    },
  ]);
  const goToAddBanners = () => {
    dispatch(
      addMenu({
        id: 'banner/add',
        url: 'banner/add',
        name: t('add.banner'),
      })
    );
    navigate('/banner/add');
  };
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `banner/${row.id}`,
        id: 'banner_edit',
        name: t('edit.banner'),
      })
    );
    navigate(`/banner/${row.id}`);
  };

  const bannerDelete = () => {
    setLoadingBtn(true);
    bannerService
      .delete({ ids: selectedRows })
      .then(() => {
        dispatch(fetchBanners());
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
        dispatch(fetchBanners());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBanners());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchBanners({ perPage: pageSize, page: current }));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
    },
  };

  return (
    <Card
      title={t('banners')}
      navLInkTo={''}
      extra={
        <Space>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddBanners}
          >
            {t('add.banner')}
          </Button>
          <DeleteButton onClick={bannerDelete} type='danger'>
            {t('delete.all')}
          </DeleteButton>
          <FilterColumns setColumns={setColumns} columns={columns} />
        </Space>
      }
    >
      <Table
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={banners}
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
        click={type ? handleActive : bannerDelete}
        text={type ? t('set.active.banner') : t('delete.banner')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Banners;
