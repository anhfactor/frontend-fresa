import React, { useEffect, useState } from 'react';
import { Card, Table, Image, Row, Col, Descriptions, Tag, Button } from 'antd';
import { useParams } from 'react-router-dom';
import getImage from '../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import OrderStatusModal from './status-modal';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../helpers/numberToPrice';
import refundService from '../../services/refund';
import { IMG_URL } from '../../configs/app-global';
const statusList = ['pending', 'accepted', 'canceled'];

export default function RefundDetails() {
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

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (id, row) => row?.shopProduct?.id,
    },
    {
      title: t('product.name'),
      dataIndex: 'product',
      key: 'product',
      render: (title, row) => row.shopProduct?.product?.translation?.title,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => (
        <Image
          src={getImage(row.shopProduct?.product?.img)}
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
        numberToPrice(origin_price, defaultCurrency?.symbol),
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
        numberToPrice(discount / row.quantity, defaultCurrency?.symbol),
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax, row) =>
        numberToPrice(tax / row.quantity, defaultCurrency?.symbol),
    },
    {
      title: t('total.price'),
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price) =>
        numberToPrice(total_price, defaultCurrency?.symbol),
    },
  ];

  const handleCloseModal = () => {
    setOrderDetails(null);
  };

  function fetchOrder() {
    setLoading(true);
    refundService
      .getById(id)
      .then(({ data }) => {
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  return (
    <>
      <Row hidden={loading} className='mb-3' gutter={24}>
        <Col span={8}>
          <Card
            title={t('refund')}
            style={{ height: '95%' }}
            extra={
              data?.status === 'pending' && (
                <Button size='small' onClick={() => setOrderDetails(data)}>
                  {t('answer')}
                </Button>
              )
            }
          >
            <Descriptions>
              <Descriptions.Item label={t('id')} span={3}>
                #{data?.id}
              </Descriptions.Item>
              <Descriptions.Item label={t('message_user')} span={3}>
                {data?.message_user}
              </Descriptions.Item>
              <Descriptions.Item label={t('message_seller')} span={3}>
                {data?.message_seller || t('not answered')}
              </Descriptions.Item>
              <Descriptions.Item label={t('status')} span={3}>
                <Tag>{data?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('image')} span={3}>
                {data?.galleries?.map((item) => (
                  <Image width={60} src={IMG_URL + item.path} />
                ))}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('client')} style={{ height: '95%' }}>
            <Descriptions>
              <Descriptions.Item label={t('id')} span={3}>
                {data?.user?.id}
              </Descriptions.Item>
              <Descriptions.Item label={t('client')} span={3}>
                {data?.user?.firstname} {data?.user?.lastname}
              </Descriptions.Item>
              <Descriptions.Item label={t('phone')} span={3}>
                {data?.user?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('email')} span={3}>
                {data?.user?.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('order')} style={{ height: '95%' }}>
            <Descriptions>
              <Descriptions.Item label={t('id')} span={3}>
                #{data?.order?.id}
              </Descriptions.Item>
              <Descriptions.Item label={t('created.at')} span={3}>
                {data?.order?.created_at}
              </Descriptions.Item>
              <Descriptions.Item label={t('status')} span={3}>
                <Tag>{data?.order?.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('total.amount')} span={3}>
                {numberToPrice(data?.order?.price, defaultCurrency.symbol)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Card>
        <Table
          scroll={{ x: 1024 }}
          columns={columns}
          dataSource={data?.order?.details || []}
          loading={loading}
          rowKey={(record) => record?.id}
          pagination={false}
        />
        {orderDetails && (
          <OrderStatusModal
            orderDetails={orderDetails}
            handleCancel={handleCloseModal}
            status={statusList}
          />
        )}
      </Card>
    </>
  );
}
