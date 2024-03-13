import React, { useState } from 'react';
import { Button, Col, Descriptions, Image, Modal, Row, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../../../helpers/getImage';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import numberToPrice from '../../../../helpers/numberToPrice';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../../../../redux/slices/cart';
import numberToQuantity from '../../../../helpers/numberToQuantity';

export default function ProductModal({ extrasModal: data, setExtrasModal }) {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(data.min_qty || data.quantity);
  const dispatch = useDispatch();
  const { currentBag, currency } = useSelector(
    (state) => state.cart,
    shallowEqual
  );

  const handleCancel = () => {
    setExtrasModal(false);
  };

  const handleSubmit = () => {
    const orderItem = {
      ...data,
      quantity: counter,
      current_qty: data.quantity,
      bag_id: currentBag,
    };
    if (orderItem.quantity > data.quantity) {
      toast.warning(`${t('you.cannot.order.more.than')} ${data.quantity}`);
      return;
    }
    console.log(orderItem);

    dispatch(addToCart(orderItem));
    setExtrasModal(null);
  };

  function addCounter() {
    if (counter === data?.quantity) {
      return;
    }
    if (counter === data.max_qty) {
      return;
    }
    setCounter((prev) => prev + 1);
  }

  function reduceCounter() {
    if (counter === 1) {
      return;
    }
    if (counter <= data.min_qty) {
      return;
    }
    setCounter((prev) => prev - 1);
  }

  return (
    <Modal
      visible={!!data}
      title={data.name}
      onCancel={handleCancel}
      footer={[
        <Button key='add-product' type='primary' onClick={handleSubmit}>
          {t('add')}
        </Button>,
        <Button key='cancel-product' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Row gutter={24}>
        <Col span={8}>
          <Image
            src={getImage(data.img)}
            alt={data.name}
            height={200}
            style={{ objectFit: 'contain' }}
          />
        </Col>
        <Col span={16}>
          <Descriptions title={data.product?.translation?.title}>
            <Descriptions.Item label={t('price')} span={3}>
              <div className={data?.discount ? 'strike' : ''}>
                {numberToPrice(data?.price, currency.symbol)}
              </div>
              {data?.discount ? (
                <div className='ml-2 font-weight-bold'>
                  {numberToPrice(data?.price - data?.discount, currency.symbol)}
                </div>
              ) : (
                ''
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('in.stock')} span={3}>
              {numberToQuantity(data?.quantity, data.product.unit)}
            </Descriptions.Item>
            <Descriptions.Item label={t('tax')} span={3}>
              {numberToPrice(data?.tax, currency.symbol)}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      <Row gutter={12} className='mt-3'>
        <Col span={24}>
          <Space>
            <Button
              type='primary'
              icon={<MinusOutlined />}
              onClick={reduceCounter}
            />
            {counter}
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={addCounter}
            />
          </Space>
        </Col>
      </Row>
    </Modal>
  );
}
