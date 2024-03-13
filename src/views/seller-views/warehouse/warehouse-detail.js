import { Card, Col, Descriptions, Image, List, Row, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import warehouseService from '../../../services/seller/warehouse';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import { toast } from 'react-toastify';
import { IMG_URL } from '../../../configs/app-global';
import {
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import Loading from '../../../components/loading';

function WarehouseDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { activeMenu } = useSelector((state) => state.menu);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const data = activeMenu.data;

  console.log('data', data);
  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      const { data } = await warehouseService.getById(id);
      dispatch(setMenuData({ activeMenu, data }));
      dispatch(disableRefetch(activeMenu));
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  console.log(activeMenu.refetch);
  useEffect(() => {
    if (activeMenu.refetch) {
      fetchWarehouse().then();
    }
  }, [activeMenu.refetch]);

  return loading ? (
    <Loading />
  ) : (
    <>
      <Card title={t('warehouse.details') + ` #${data?.id}`}>
        <Descriptions>
          <Descriptions.Item label={t('quantity')}>
            {data?.quantity}
          </Descriptions.Item>
          <Descriptions.Item label={t('note')}>{data?.note}</Descriptions.Item>
          <Descriptions.Item label={t('type')}>
            {data?.type === 'income' ? (
              <Tag icon={<VerticalAlignBottomOutlined />} color='cyan'>
                {data?.type}
              </Tag>
            ) : (
              <Tag icon={<VerticalAlignTopOutlined />} color='blue'>
                {data?.type}
              </Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
        <Row gutter={50}>
          <Col span={12}>
            <List size='small' header={t('user')}>
              <List.Item>
                <span className='font-weight-bold'>{t('id')}</span>:{' '}
                {data?.user?.id}
              </List.Item>
              <List.Item>
                <span className='font-weight-bold'>{t('firstname')}</span>:{' '}
                {data?.user?.firstname}
              </List.Item>
              <List.Item>
                <span className='font-weight-bold'>{t('lastname')}</span>:{' '}
                {data?.user?.lastname}
              </List.Item>
              <List.Item>
                <span className='font-weight-bold'>{t('email')}</span>:{' '}
                {data?.user?.email}
              </List.Item>
              <List.Item>
                <span className='font-weight-bold'>{t('phone')}</span>:{' '}
                <a href={`tel:+${data?.user?.phone}`}>{data?.user?.phone}</a>
              </List.Item>
            </List>
          </Col>
          <Col span={12}>
            <List header={t('product')}>
              <List.Item>
                <span className='font-weight-bold'>{t('id')}</span>:{' '}
                {data?.shop_product?.id}
              </List.Item>
              <List.Item>
                <span className='font-weight-bold'>{t('name')}</span>:{' '}
                {data?.shop_product?.product?.translation?.title}
              </List.Item>
              <List.Item className='d-flex justify-content-start'>
                <span className='font-weight-bold'>{t('image')}</span>:{' '}
                <Image
                  width={100}
                  src={IMG_URL + data?.shop_product?.product?.img}
                  placeholder
                  style={{ borderRadius: 4 }}
                />
              </List.Item>
            </List>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default WarehouseDetail;
