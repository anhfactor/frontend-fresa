import React, { useEffect, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Card,
  Tabs,
  Tag,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarcodeOutlined,
  BarsOutlined,
  ClearOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import download from 'downloadjs';
import useDidUpdate from '../../helpers/useDidUpdate';
import {
  changeLayout,
  clearItems,
  fetchAcceptedOrders,
  fetchCanceledOrders,
  fetchDeliveredOrders,
  fetchNewOrders,
  fetchOnAWayOrders,
  fetchOrders,
  fetchReadyOrders,
  handleSearch,
} from '../../redux/slices/orders';
import formatSortType from '../../helpers/formatSortType';
import SearchInput from '../../components/search-input';
import { clearOrder } from '../../redux/slices/order';
import numberToPrice from '../../helpers/numberToPrice';
import { DebounceSelect } from '../../components/search';
import userService from '../../services/user';
import exportService from '../../services/export';
import OrderStatusModal from './orderStatusModal';
import OrderDeliveryman from './orderDeliveryman';
import FilterColumns from '../../components/filter-column';
import Incorporate from './dnd/Incorporate';
import { batch } from 'react-redux';
import moment from 'moment';
import shopService from '../../services/shop';
const { TabPane } = Tabs;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const statuses = [
  'all',
  'new',
  'accepted',
  'ready',
  'on_a_way',
  'delivered',
  'canceled',
];

export default function AllOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { type } = useParams();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const [downloading, setDownloading] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [dateRange, setDateRange] = useState(
    moment().subtract(1, 'months'),
    moment()
  );
  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${row.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      })
    );
    navigate(`/order/${row.id}`);
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/order/details/${row.id}`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('client'),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          {user?.firstname} {user?.lastname}
        </div>
      ),
    },
    {
      title: t('number.of.products'),
      is_show: true,
      dataIndex: 'order_details_count',
      key: 'order_details_count',
      render: (order_details_count) => (
        <div className='text-lowercase'>
          {order_details_count} {t('products')}
        </div>
      ),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {status !== 'delivered' && status !== 'canceled' ? (
            <EditOutlined onClick={() => setOrderDetails(row)} />
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: t('deliveryman'),
      is_show: true,
      dataIndex: 'deliveryman',
      key: 'deliveryman',
      render: (deliveryman, row) => (
        <div>
          {row.status === 'ready' ? (
            <Button type='link' onClick={() => setOrderDeliveryDetails(row)}>
              <Space>
                {deliveryman
                  ? `${deliveryman.firstname} ${deliveryman.lastname}`
                  : t('add.deliveryman')}
                <EditOutlined />
              </Space>
            </Button>
          ) : (
            <div>
              {deliveryman?.firstname} {deliveryman?.lastname}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('amount'),
      is_show: true,
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price, defaultCurrency.symbol),
    },
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) =>
        t(transaction?.payment_system?.payment?.tag) || '-',
    },
    {
      title: t('gift.recipient.name'),
      is_show: true,
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '-',
    },
    {
      title: t('gift.recipient.phone'),
      is_show: true,
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
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
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => goToShow(row)} />
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={row.status === 'delivered' || row.status === 'canceled'}
            />
            <Button
              icon={<DownloadOutlined />}
              loading={downloading === row.id}
              onClick={() => getInvoiceFile(row)}
            />
          </Space>
        );
      },
    },
  ]);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { allShops } = useSelector((state) => state.allShops, shallowEqual);

  const { orders, meta, loading, params, layout, boardItems, statistic } =
    useSelector((state) => state.orders, shallowEqual);
  const data = activeMenu?.data;

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, perPage, page, column, sort },
      })
    );
  }

  useDidUpdate(() => {
    const paramsData = {
      search: data?.search,
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
      user_id: data?.user_id,
      status: data?.status,
      shop_id: data?.shop_id,
      delivery_type: type !== 'scheduled' ? type : undefined,
      delivery_date_from:
        type === 'scheduled'
          ? moment().add(1, 'day').format('YYYY-MM-DD')
          : undefined,
      date_from: dateRange?.[0]?.format('YYYY-MM-DD') || null,
      date_to: dateRange?.[1]?.format('YYYY-MM-DD') || null,
    };
    if (layout === 'table' && data) {
      dispatch(fetchOrders(paramsData));
    } else if (data) {
      dispatch(handleSearch(paramsData));
    }
  }, [data, dateRange, type]);

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...{ [name]: item } },
      })
    );
  };

  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
    };
    return userService.search(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    });
  }

  const goToAddProduct = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'pos-system',
        url: 'pos-system',
        name: t('pos.system'),
      })
    );
    navigate('/pos-system');
  };

  const onChangeTab = (status) => {
    const orderStatus = status === 'all' ? undefined : status;
    dispatch(setMenuData({ activeMenu, data: { status: orderStatus } }));
  };

  function getInvoiceFile({ id }) {
    setDownloading(id);
    exportService
      .orderExport(id)
      .then((res) => {
        download(res, `invoice_${id}.pdf`, 'application/pdf');
      })
      .finally(() => setDownloading(null));
  }

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
  };

  useEffect(() => {
    if (activeMenu?.refetch && layout === 'table') {
      const params = {
        status: null,
        page: data?.page,
        perPage: 20,
      };
      batch(() => {
        dispatch(fetchOrders(params));
        dispatch(disableRefetch(activeMenu));
      });
    }
  }, [activeMenu?.refetch, layout]);

  const fetchOrdersCase = (params) => {
    const paramsWithType = {
      ...params,
      delivery_type: type !== 'scheduled' ? type : undefined,
      delivery_date_from:
        type === 'scheduled'
          ? moment().add(1, 'day').format('YYYY-MM-DD')
          : undefined,
    };
    switch (params.status) {
      case 'new':
        dispatch(fetchNewOrders(paramsWithType));
        break;
      case 'accepted':
        dispatch(fetchAcceptedOrders(paramsWithType));
        break;
      case 'ready':
        dispatch(fetchReadyOrders(paramsWithType));
        break;
      case 'on_a_way':
        dispatch(fetchOnAWayOrders(paramsWithType));
        break;
      case 'delivered':
        dispatch(fetchDeliveredOrders(paramsWithType));
        break;
      case 'canceled':
        dispatch(fetchCanceledOrders(paramsWithType));
        break;
      default:
        console.log(`Sorry, we are out of`);
    }
  };

  const fetchOrderAllItem = () => {
    fetchOrdersCase({ status: 'new' });
    fetchOrdersCase({ status: 'accepted' });
    fetchOrdersCase({ status: 'ready' });
    fetchOrdersCase({ status: 'on_a_way' });
    fetchOrdersCase({ status: 'delivered' });
    fetchOrdersCase({ status: 'canceled' });
  };

  const handleClear = () => {
    setDateRange({});
    batch(() => {
      dispatch(clearItems());
      dispatch(
        setMenuData({
          activeMenu,
          data: null,
        })
      );
    });
    if (layout === 'board') {
      fetchOrderAllItem();
    } else
      dispatch(fetchOrders({ status: null, page: data?.page, perPage: 20 }));
  };
  async function fetchShops(search) {
    const params = { search, status: 'approved' };
    return shopService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  return (
    <>
      <Card>
        <Space className='order-filter'>
          <SearchInput
            style={{ width: '100%' }}
            defaultValue={data?.search}
            resetSearch={!data?.search}
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <DebounceSelect
            placeholder={t('select.shop')}
            fetchOptions={fetchShops}
            style={{ width: '100%' }}
            onSelect={(shop) => handleFilter(shop.value, 'shop_id')}
            onDeselect={() => handleFilter(null, 'shop_id')}
            allowClear={true}
            value={data?.shop_id}
          />
          <DebounceSelect
            placeholder={t('select.client')}
            fetchOptions={getUsers}
            onSelect={(user) => handleFilter(user.value, 'user_id')}
            onDeselect={() => handleFilter(null, 'user_id')}
            style={{ width: '100%' }}
            value={data?.user_id}
          />
          <RangePicker
            value={dateRange}
            onChange={(values) => {
              handleFilter((prev) => ({
                ...prev,
                ...{
                  date_from: values?.[0]?.format('YYYY-MM-DD'),
                  date_to: values?.[1]?.format('YYYY-MM-DD'),
                },
              }));
              setDateRange(values);
            }}
            disabledDate={(current) => {
              return current && current > moment().endOf('day');
            }}
            style={{ width: '100%' }}
          />
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={Boolean(!data)}
            style={{ width: '100%' }}
          >
            {t('clear')}
          </Button>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddProduct}
            style={{ width: '100%' }}
          >
            {t('add.order')}
          </Button>
          {layout !== 'board' && (
            <FilterColumns setColumns={setColumns} columns={columns} />
          )}
        </Space>
      </Card>
      <Tabs
        defaultActiveKey={layout}
        onTabClick={(key) => dispatch(changeLayout(key))}
      >
        <Tabs.TabPane
          tab={
            <span>
              <BarcodeOutlined />
              {t('Board')}
            </span>
          }
          key='board'
        >
          {layout === 'board' && (
            <Incorporate
              type={type}
              statistic={statistic}
              orders={orders}
              goToEdit={goToEdit}
              goToShow={goToShow}
              getInvoiceFile={getInvoiceFile}
              boardItems={boardItems}
              meta={meta}
              fetchOrderAllItem={fetchOrderAllItem}
              fetchOrders={fetchOrdersCase}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <span>
              <BarsOutlined />
              {t('List')}
            </span>
          }
          key='table'
        >
          {layout === 'table' && (
            <Card>
              <Tabs onChange={onChangeTab} type='card' activeKey={data?.status}>
                {statuses.map((item) => (
                  <TabPane tab={t(item)} key={item} />
                ))}
              </Tabs>
              <Table
                columns={columns?.filter((items) => items.is_show)}
                dataSource={orders}
                loading={loading}
                pagination={{
                  pageSize: params.perPage,
                  page: params.page,
                  total: meta.total,
                  defaultCurrent: params.page,
                }}
                rowKey={(record) => record.id}
                onChange={onChangePagination}
              />
              {orderDetails && (
                <OrderStatusModal
                  orderDetails={orderDetails}
                  handleCancel={handleCloseModal}
                />
              )}
              {orderDeliveryDetails && (
                <OrderDeliveryman
                  orderDetails={orderDeliveryDetails}
                  handleCancel={handleCloseModal}
                />
              )}
            </Card>
          )}
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}
