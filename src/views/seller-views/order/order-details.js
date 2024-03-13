import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Image,
  Tag,
  Button,
  Space,
  Descriptions,
  Row,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import orderService from '../../../services/seller/order';
import getImage from '../../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import OrderStatusModal from './orderStatusModal';
import OrderDeliveryman from './orderDeliveryman';
import { fetchSellerDeliverymans } from '../../../redux/slices/deliveryman';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../../helpers/numberToPrice';

export default function SellerOrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const data = activeMenu.data;
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (id, row) => row.shopProduct?.product.id,
    },
    {
      title: t('product.name'),
      dataIndex: 'product',
      key: 'product',
      render: (title, row) => row.shopProduct?.product.translation?.title,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => (
        <Image
          src={getImage(row.shopProduct?.product.img)}
          alt='product'
          width={100}
          height='auto'
          className='rounded'
          preview
          placeholder
        />
      ),
    },
    {
      title: t('price'),
      dataIndex: 'origin_price',
      key: 'origin_price',
      render: (origin_price) =>
        numberToPrice(origin_price, defaultCurrency.symbol),
    },
    {
      title: t('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('discount'),
      dataIndex: 'discount',
      key: 'discount',
      render: (discount = 0, row) =>
        numberToPrice(discount / row.quantity, defaultCurrency.symbol),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax, row) =>
        numberToPrice(tax / row.quantity, defaultCurrency.symbol),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price) =>
        numberToPrice(total_price, defaultCurrency.symbol),
    },
  ];

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
  };

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then(({ data }) => {
        const currency = data.currency;
        const user = data.user;
        const id = data.id;
        const price = data.price;
        const createdAt = data.created_at;
        const details = data.details.map((item) => ({
          ...item,
          title: item.shop?.translation?.title,
        }));
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...data, details, currency, user, id, createdAt, price },
          })
        );
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
      dispatch(fetchSellerDeliverymans());
    }
  }, [activeMenu.refetch]);

  return (
    <Card title={`${t('order.details')} ${data?.id ? `#${data?.id}` : ''}`}>
      <Row hidden={loading} className='mb-3'>
        <Descriptions>
          <Descriptions.Item label={t('client')}>
            {data?.user?.firstname} {data?.user?.lastname}
          </Descriptions.Item>
          <Descriptions.Item label={t('phone')}>
            {data?.user?.phone}
          </Descriptions.Item>
          <Descriptions.Item label={t('email')}>
            {data?.user?.email}
          </Descriptions.Item>
          <Descriptions.Item label={t('address')}>
            {data?.delivery_address?.address}
          </Descriptions.Item>
          <Descriptions.Item label={t('delivery.type')}>
            {data?.delivery_type?.translation?.title}
          </Descriptions.Item>
          <Descriptions.Item label={t('delivery.date.&.time')}>
            {data?.delivery_date} {data?.delivery_time}
          </Descriptions.Item>
          <Descriptions.Item label={t('delivery.fee')}>
            {numberToPrice(data?.delivery_fee, defaultCurrency.symbol)}
          </Descriptions.Item>
          <Descriptions.Item label={t('order.tax')}>
            {numberToPrice(data?.tax, defaultCurrency.symbol)}
          </Descriptions.Item>
          <Descriptions.Item label={t('coupon')}>
            {numberToPrice(data?.coupon?.price, defaultCurrency.symbol)}
          </Descriptions.Item>
          <Descriptions.Item label={t('status')}>
            {data?.status === 'new' ? (
              <Tag color='blue'>{t(data?.status)}</Tag>
            ) : data?.status === 'canceled' ? (
              <Tag color='error'>{t(data?.status)}</Tag>
            ) : (
              <Tag color='cyan'>{t(data?.status)}</Tag>
            )}
            {data?.status !== 'delivered' && data?.status !== 'canceled' ? (
              <EditOutlined onClick={() => setOrderDetails(data)} />
            ) : (
              ''
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('deliveryman')}>
            {data?.status === 'ready' ? (
              <Button
                type='link'
                style={{ padding: '0', height: 'auto' }}
                onClick={() => setOrderDeliveryDetails(data)}
              >
                <Space>
                  {data?.deliveryman
                    ? `${data?.deliveryman.firstname} ${data?.deliveryman.lastname}`
                    : t('add.deliveryman')}
                  <EditOutlined />
                </Space>
              </Button>
            ) : (
              <div>
                {data?.deliveryman?.firstname} {data?.deliveryman?.lastname}
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('payment.status')}>
            {t(data?.transaction?.status)}
          </Descriptions.Item>
          <Descriptions.Item label={t('created.at')}>
            {data?.created_at}
          </Descriptions.Item>
          <Descriptions.Item label={t('payment.type')}>
            {t(data?.transaction?.payment_system?.payment?.tag)}
          </Descriptions.Item>
          <Descriptions.Item label={t('amount')}>
            {numberToPrice(data?.price, defaultCurrency.symbol)}
          </Descriptions.Item>
        </Descriptions>
      </Row>
      <Table
        columns={columns}
        dataSource={activeMenu.data?.details || []}
        loading={loading}
        rowKey={(record) => record.id}
        pagination={false}
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
  );
}
