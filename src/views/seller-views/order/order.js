import React, { useEffect, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Card,
  Tabs,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BarcodeOutlined,
  BarsOutlined,
  ClearOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from '../../../helpers/useDidUpdate';
import formatSortType from '../../../helpers/formatSortType';
import SearchInput from '../../../components/search-input';
import { clearOrder } from '../../../redux/slices/order';
import numberToPrice from '../../../helpers/numberToPrice';
import { DebounceSelect } from '../../../components/search';
import userService from '../../../services/seller/user';
import FilterColumns from '../../../components/filter-column';
import Incorporate from './dnd/Incorporate';
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
} from '../../../redux/slices/sellerOrders';
import { batch } from 'react-redux';
import moment from 'moment';
import exportService from 'services/export';
import download from 'downloadjs';
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const statuses = [
  'all',
  'new',
  'accepted',
  'ready',
  'on_a_way',
  'delivered',
  'canceled',
];

export default function SellerOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const { orders, meta, loading, params, layout, boardItems, statistic } =
    useSelector((state) => state.sellerOrders, shallowEqual);
  const [dateRange, setDateRange] = useState(
    moment().subtract(1, 'months'),
    moment()
  );

  const data = activeMenu?.data;

  const goToAddProduct = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'order-add',
        url: 'seller/orders/add',
        name: t('add.order'),
      })
    );
    navigate('/seller/orders/add');
  };

  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `seller/orders/${row.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      })
    );
    navigate(`/seller/orders/${row.id}`);
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `seller/order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/seller/order/details/${row.id}`);
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
      key: 'rate',
      render: (item) => (
        <div className='text-lowercase'>
          {item} {t('products')}
        </div>
      ),
    },
    {
      title: t('amount'),
      is_show: true,
      dataIndex: 'price',
      key: 'price',
      render: (price, row) => {
        const totalPrice = price;
        return numberToPrice(totalPrice, defaultCurrency.symbol);
      },
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
          </Space>
        );
      },
    },
  ]);

  function onChangePagination(pagination, sorter) {
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
      date_from: dateRange?.[0]?.format('YYYY-MM-DD') || null,
      date_to: dateRange?.[1]?.format('YYYY-MM-DD') || null,
    };
    if (layout === 'table' && data) {
      dispatch(fetchOrders(paramsData));
    } else if (data) {
      dispatch(handleSearch(paramsData));
    }
  }, [data]);

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
    return userService.getAll(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    });
  }

  const onChangeTab = (status) => {
    const orderStatus = status === 'all' ? undefined : status;
    dispatch(setMenuData({ activeMenu, data: { status: orderStatus } }));
  };

  const fetchOrdersCase = (params) => {
    switch (params.status) {
      case 'new':
        dispatch(fetchNewOrders(params));
        break;
      case 'accepted':
        dispatch(fetchAcceptedOrders(params));
        break;
      case 'ready':
        dispatch(fetchReadyOrders(params));
        break;
      case 'on_a_way':
        dispatch(fetchOnAWayOrders(params));
        break;
      case 'delivered':
        dispatch(fetchDeliveredOrders(params));
        break;
      case 'canceled':
        dispatch(fetchCanceledOrders(params));
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

  function getInvoiceFile({ id }) {
    exportService.orderExport(id).then((res) => {
      download(res, `invoice_${id}.pdf`, 'application/pdf');
    });
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
              orders={orders}
              goToEdit={goToEdit}
              goToShow={goToShow}
              boardItems={boardItems}
              meta={meta}
              fetchOrderAllItem={fetchOrderAllItem}
              fetchOrders={fetchOrdersCase}
              statistic={statistic}
              getInvoiceFile={getInvoiceFile}
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
            </Card>
          )}
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}
