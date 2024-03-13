import { Card, Col, Row, Space, Typography, Table, Button, Spin } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { CloudDownloadOutlined } from '@ant-design/icons';
import ReportService from '../../services/reports';
import { disableRefetch } from '../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../components/report/chart';
import { ReportContext } from '../../context/report';
import FilterColumns from '../../components/filter-column';
import useDidUpdate from '../../helpers/useDidUpdate';
import FilterByDate from '../../components/report/filter';
import { getReportValue } from '../../helpers/getReportPrice';
import {
  fetchShopsProduct,
  fetchShopsProductChart,
  ShopsProductCompare,
} from '../../redux/slices/report/shops';
import { t } from 'i18next';
const { Text, Title } = Typography;

const ReportShops = () => {
  const dispatch = useDispatch();
  const [chart, handleChart] = useState('items_sold');
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList,
    error,
  } = useSelector((state) => state.productShops, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const [columns, setColumns] = useState([
    {
      title: 'Shop',
      dataIndex: 'shop_translation_title',
      key: 'shop_translation_title',
      is_show: true,
    },
    {
      title: 'Seller',
      dataIndex: 'seller_lastname',
      key: 'seller_lastname',
      render: (_, data) =>
        `${data?.seller_firstname || '-'} ${data?.seller_lastname || '-'}`,
      is_show: true,
    },
    {
      title: 'completed orders count',
      dataIndex: 'completed_orders_count',
      key: 'completed_orders_count',
      is_show: true,
    },
    {
      title: 'completed orders price sum',
      dataIndex: 'completed_orders_price_sum',
      key: 'completed_orders_price_sum',
      is_show: true,
    },
    {
      title: 'canceled orders count',
      dataIndex: 'canceled_orders_count',
      key: 'canceled_orders_count',
      is_show: true,
    },
    {
      title: 'canceled orders price sum',
      dataIndex: 'canceled_orders_price_sum',
      key: 'canceled_orders_price_sum',
      is_show: true,
    },
    {
      title: 'items sold',
      dataIndex: 'items_sold',
      key: 'items_sold',
      is_show: true,
    },
    {
      title: 'net sales',
      dataIndex: 'net_sales',
      key: 'net_sales',
      is_show: true,
    },
    {
      title: 'products count',
      dataIndex: 'products_count',
      key: 'products_count',
      is_show: true,
    },
    {
      title: 'tax earned',
      dataIndex: 'tax_earned',
      key: 'tax_earned',
      is_show: true,
    },
    {
      title: 'total earned',
      dataIndex: 'total_earned',
      key: 'total_earned',
      is_show: true,
    },
    {
      title: 'commission earned',
      dataIndex: 'commission_earned',
      key: 'commission_earned',
      is_show: true,
    },
    {
      title: 'delivery earned',
      dataIndex: 'delivery_earned',
      key: 'delivery_earned',
      is_show: true,
    },
  ]);

  const chart_type = [
    {
      value: 'shops_count',
      label: 'Shops Count',
      qty: 'shopsCount',
      isPrice: false,
    },
    {
      value: 'products_count',
      label: 'Products Count',
      qty: 'productsCount',
      isPrice: false,
    },
    {
      value: 'completed_orders_count',
      label: 'Completed Orders Count',
      qty: 'completedOrdersCount',
      isPrice: false,
    },
    {
      value: 'completed_orders_price_sum',
      label: 'Completed Orders Price Sum',
      qty: 'completedOrdersPriceSum',
      isPrice: true,
    },
    {
      value: 'canceled_orders_count',
      label: 'Completed Orders Count',
      qty: 'completedOrdersCount',
      isPrice: false,
    },
    {
      value: 'canceled_orders_price_sum',
      label: 'Canceled Orders Price Sum',
      qty: 'canceledOrdersPriceSum',
      isPrice: true,
    },
    {
      value: 'items_sold',
      label: 'Items Sold',
      qty: 'itemsSold',
      isPrice: false,
    },
    {
      value: 'net_sales',
      label: 'Net Sales',
      qty: 'netSales',
      isPrice: true,
    },
    {
      value: 'total_earned',
      label: 'Total Earned',
      qty: 'totalEarned',
      isPrice: true,
    },
    {
      value: 'delivery_earned',
      label: 'Delivery Earned',
      qty: 'deliveryEarned',
      isPrice: true,
    },
    {
      value: 'tax_earned',
      label: 'Tax Earned',
      qty: 'taxEarned',
      isPrice: true,
    },
  ];

  const fetchReport = () => {
    const params = {
      date_from,
      date_to,
      by_time,
      chart,
      sellers,
      shops,
    };
    dispatch(fetchShopsProductChart(params));
  };

  const fetchProduct = (page, perPage) => {
    const params = {
      date_from,
      date_to,
      by_time,
      page,
      perPage,
      sellers,
      shops,
    };
    dispatch(fetchShopsProduct(params));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct();
      fetchReport();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchProduct();
  }, [date_to, sellers, shops]);

  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, sellers, shops]);

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };
  const excelExport = () => {
    setDownloading(true);
    ReportService.getShopsProducts({
      date_from,
      date_to,
      by_time,
      export: 'excel',
    })
      .then((res) => {
        const body = res.data.link;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const Compare = () => {
    const params = {
      date_from,
      date_to,
      by_time,
      chart,
      ids: selectedRowKeys,
      sellers,
      shops,
    };
    dispatch(ShopsProductCompare(params));
  };
  const clear = () => {
    setSelectedRowKeys([]);
    fetchProduct();
    fetchReport();
  };
  const filteredColumns = columns?.filter((item) => item.is_show);
  return (
    <Spin size='large' spinning={loading}>
      <FilterByDate />
      <Row gutter={24} className='report-products'>
        {chart_type?.map((item) => (
          <Col
            span={6}
            key={item.label}
            onClick={() => handleChart(item.value)}
          >
            <Card className={chart === item.value && 'active'}>
              <Row className='mb-5'>
                <Col>
                  <Text>{t(item.label)}</Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={2} style={{ whiteSpace: 'nowrap' }}>
                    {getReportValue(
                      reportData?.defaultCurrency?.symbol,
                      reportData[item.qty],
                      item.isPrice
                    )}
                  </Title>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
      <ReportChart reportData={reportData} chart_data='quantities_sum' />
      <Card>
        <Row
          gutter={24}
          className='align-items-center justify-content-between mb-4'
        >
          <Col span={3}>
            <Title level={2} className='mb-0'>
              {t('Products')}
            </Title>
          </Col>
          <Col span={6} className='d-flex justify-content-end'>
            <Space>
              <Button
                color='geekblue'
                onClick={Compare}
                disabled={Boolean(!selectedRowKeys.length)}
              >
                {t('Compare')}
              </Button>
              <Button onClick={clear}>{t('Clear')}</Button>
              <Button
                icon={<CloudDownloadOutlined />}
                loading={downloading}
                onClick={excelExport}
              >
                {t('Download')}
              </Button>
              <FilterColumns columns={columns} setColumns={setColumns} />
            </Space>
          </Col>
        </Row>
        <Table
          rowSelection={filteredColumns?.length ? rowSelection : null}
          columns={filteredColumns}
          dataSource={productList.data || []}
          rowKey={(row) => row.id}
          loading={loading}
          pagination={{
            pageSize: productList?.per_page,
            page: productList?.current_page || 1,
            total: productList?.total,
            defaultCurrent: 1,
          }}
          onChange={onChangePagination}
          scroll={{
            x: 1500,
          }}
        />
      </Card>
    </Spin>
  );
};

export default ReportShops;
