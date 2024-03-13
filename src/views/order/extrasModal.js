import React, { useState } from 'react';
import { Button, Col, Descriptions, Image, Modal, Row, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../helpers/getImage';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { addOrderItem } from '../../redux/slices/order';
import numberToPrice from '../../helpers/numberToPrice';
import { toast } from 'react-toastify';
import numberToQuantity from '../../helpers/numberToQuantity';
import { useTranslation } from 'react-i18next';
import { BsFillGiftFill } from 'react-icons/bs';

export default function ExtrasModal({ extrasModal: data, setExtrasModal }) {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(data.min_qty);

  const { currency } = useSelector((state) => state.order.data, shallowEqual);
  const dispatch = useDispatch();

  console.log('data => ', data);

  const handleOk = () => {
    console.log('ok');
  };

  const handleCancel = () => {
    setExtrasModal(false);
  };

  const handleSubmit = () => {
    const orderItem = {
      ...data,
      quantity: counter,
    };
    if (orderItem.quantity > data.quantity) {
      toast.warning(`${t('you.cannot.order.more.than')} ${data.quantity}`);
      return;
    }
    dispatch(addOrderItem(orderItem));
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

  console.log(data);
  return (
    <Modal
      visible={!!data}
      title={data.translation?.title}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={handleSubmit}>
          {t('add')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Row gutter={24}>
        <Col span={8} className='order'>
          <Image
            src={getImage(data.product.img)}
            alt={data.translation?.title}
            height={200}
            style={{ objectFit: 'contain' }}
          />
          <span className={data.bonus ? 'show-bonus' : 'd-none'}>
            <BsFillGiftFill /> {data.bonus?.shop_product_quantity}
            {'+'}
            {data.bonus?.bonus_quantity}
          </span>
        </Col>
        <Col span={16}>
          <Descriptions title={data.translation?.title}>
            <Descriptions.Item label={t('price')} span={3}>
              <div className={data?.discount ? 'strike' : ''}>
                {numberToPrice(data?.price, currency?.symbol)}
              </div>
              {data?.discount ? (
                <div className='ml-2 font-weight-bold'>
                  {numberToPrice(data?.discount, currency?.symbol)}
                </div>
              ) : (
                ''
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('in.stock')} span={3}>
              {/*{numberToQuantity((data?.quantity)(data?.product?.unit))}*/}
              {numberToQuantity(data?.quantity, data?.product?.unit)}
            </Descriptions.Item>
            <Descriptions.Item label={t('tax')} span={3}>
              {numberToPrice(data?.tax, currency?.symbol)}
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
