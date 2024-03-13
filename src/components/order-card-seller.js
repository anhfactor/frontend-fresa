import React from 'react';
import {
  EditOutlined,
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  ContainerOutlined,
  CarOutlined,
  DollarOutlined,
  PayCircleOutlined,
  BorderlessTableOutlined,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import { IMG_URL } from '../configs/app-global';
import numberToPrice from '../helpers/numberToPrice';
const { Meta } = Card;

const OrderCardSeller = ({
  data: item,
  goToEdit,
  goToShow,
  getInvoiceFile,
  loading,
}) => {
  const data = [
    {
      title: 'Number of products',
      icon: <ContainerOutlined />,
      data: item?.order_details_count,
    },
    {
      title: 'Deliveryman',
      icon: <CarOutlined />,
      data: `${item.deliveryman?.firstname || '-'} ${
        item.deliveryman?.lastname || '-'
      }`,
    },
    {
      title: 'Amount',
      icon: <DollarOutlined />,
      data: numberToPrice(item.price, item.currency?.symbol),
    },
    {
      title: 'Payment type',
      icon: <PayCircleOutlined />,
      data: item.transaction?.payment_system?.tag || '-',
    },
    {
      title: 'Payment status',
      icon: <BorderlessTableOutlined />,
      data: item.transaction?.status || '-',
    },
  ];
  return (
    <Card
      actions={[
        <EyeOutlined key='setting' onClick={() => goToShow(item)} />,
        <EditOutlined key='edit' onClick={() => goToEdit(item)} />,
        <DownloadOutlined
          key='ellipsis'
          onClick={() => getInvoiceFile(item)}
        />,
      ]}
      className='order-card'
    >
      <Skeleton loading={loading} avatar active>
        <Meta
          avatar={
            <Avatar src={IMG_URL + item.user?.img} icon={<UserOutlined />} />
          }
          description={`#${item.id}`}
          title={`${item.user?.firstname || '-'} ${item.user?.lastname || '-'}`}
        />
        <List
          itemLayout='horizontal'
          dataSource={data}
          renderItem={(item, key) => (
            <List.Item key={key}>
              <Space>
                {item.icon}
                {`${item.title}:  ${item.data}`}
              </Space>
            </List.Item>
          )}
        />
      </Skeleton>
    </Card>
  );
};

export default OrderCardSeller;
