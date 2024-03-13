import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Space, Spin } from 'antd';
import Meta from 'antd/lib/card/Meta';
import getImage from '../../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addOrderCoupon,
  clearOrderProducts,
  removeFromOrder,
  setOrderProducts,
  setOrderTotal,
  verifyOrderCoupon,
} from '../../../redux/slices/order';
import orderService from '../../../services/seller/order';
import ExtrasModal from './extrasModal';
import numberToPrice from '../../../helpers/numberToPrice';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { useNavigate } from 'react-router-dom';
import { addMenu } from '../../../redux/slices/menu';
import { fetchRestProducts } from '../../../redux/slices/product';
import { useTranslation } from 'react-i18next';
import invokableService from '../../../services/rest/invokable';

export default function OrderItems() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderItems, data, orderProducts, total, coupon } = useSelector(
    (state) => state.order,
    shallowEqual
  );
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const [loading, setLoading] = useState(false);
  const [extrasModal, setExtrasModal] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  function formatProducts(list) {
    const result = list.map((item, index) => ({
      [`products[${index}][id]`]: item?.id,
      [`products[${index}][quantity]`]: item?.quantity,
    }));
    return Object.assign({}, ...result);
  }

  useDidUpdate(() => {
    dispatch(
      fetchRestProducts({
        perPage: 12,
        currency_id: data.currency.id,
        shop_id: shop.id,
      })
    );
  }, [data.currency, data.shop]);

  useDidUpdate(() => {
    if (orderItems.length) {
      productCalculate();
    } else {
      dispatch(clearOrderProducts());
    }
  }, [orderItems, data.currency]);

  function productCalculate() {
    const products = formatProducts(orderItems);
    const params = {
      currency_id: data.currency.id,
      ...products,
    };
    setLoading(true);
    orderService
      .calculate(params)
      .then(({ data }) => {
        const items = data.products.map((item) => ({
          ...orderItems.find((el) => el.id === item.id),
          ...item,
        }));
        dispatch(setOrderProducts(items));
        const orderData = {
          product_total: data.product_total,
          product_tax: data.product_tax,
          order_tax: data.order_tax,
          order_total: data.order_total,
        };
        dispatch(setOrderTotal(orderData));
      })
      .finally(() => setLoading(false));
  }

  const goToProduct = (item) => {
    dispatch(
      addMenu({
        id: `product-${item.uuid}`,
        url: `product/${item.uuid}`,
        name: t('edit.product'),
      })
    );
    navigate(`/product/${item.uuid}`);
  };

  function handleCheckCoupon() {
    if (!coupon) {
      return;
    }
    setLoadingCoupon(true);
    invokableService
      .checkCoupon(coupon)
      .then((res) =>
        dispatch(
          verifyOrderCoupon({
            price: res.data.price,
            verified: true,
          })
        )
      )
      .catch(() =>
        dispatch(
          verifyOrderCoupon({
            price: 0,
            verified: false,
          })
        )
      )
      .finally(() => setLoadingCoupon(false));
  }

  return (
    <div className='order-items'>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <Row gutter={24} className='mt-4'>
        <Col span={24}>
          <Card className='shop-card'>
            {orderProducts.map((item) => (
              <Card key={item.id} className='position-relative'>
                <CloseOutlined
                  className='close-order'
                  onClick={() => dispatch(removeFromOrder(item))}
                />
                <Space className='mr-3'>
                  <div className='order-item-img'>
                    <img
                      src={getImage(item.product.img)}
                      alt={item.translation?.title}
                    />
                  </div>
                  <Meta
                    title={
                      <div>
                        <div
                          className='cursor-pointer white-space-wrap'
                          onClick={() => goToProduct(item)}
                        >
                          {item.translation?.title}
                        </div>
                        <div className='product-price'>
                          {numberToPrice(
                            item.price_without_tax,
                            data.currency.symbol
                          )}
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        {t('quantity')}: {item.quantity}
                      </div>
                    }
                  />
                </Space>
              </Card>
            ))}
            <div className='d-flex align-items-center justify-content-between'>
              <Space>
                <img
                  src={getImage(data.shop?.logo_img)}
                  alt='shop logo'
                  width={40}
                  height={40}
                  className='rounded-circle'
                />
                <div>{shop?.translation?.title}</div>
              </Space>
              <Space>
                <Input
                  placeholder={t('coupon')}
                  addonAfter={
                    coupon.verified ? (
                      <CheckOutlined style={{ color: '#18a695' }} />
                    ) : null
                  }
                  onBlur={(event) =>
                    dispatch(
                      addOrderCoupon({
                        coupon: event.target.value,
                        user_id: data.user?.id,
                        shop_id: shop.id,
                        verified: false,
                      })
                    )
                  }
                />
                <Button
                  onClick={() => handleCheckCoupon(shop.id)}
                  loading={loadingCoupon}
                >
                  {t('check.coupon')}
                </Button>
              </Space>
              <div className='mt-2 text-right shop-total'>
                <Space>
                  <p className='font-weight-bold'>{t('product.tax')}:</p>
                  <p>
                    {numberToPrice(total.product_tax, data.currency.symbol)}
                  </p>
                </Space>
                <div />
                <Space>
                  <p className='font-weight-bold'>{t('shop.tax')}:</p>
                  <p>{numberToPrice(total.order_tax, data.currency.symbol)}</p>
                </Space>
                <div />
                <Space>
                  <p className='font-weight-bold'>{t('delivery.fee')}:</p>
                  <p>
                    {numberToPrice(data.delivery_fee, data.currency.symbol)}
                  </p>
                </Space>
                <div />
                <Space>
                  <p className='font-weight-bold'>{t('total')}:</p>
                  <p>
                    {numberToPrice(
                      total.order_total + data.delivery_fee,
                      data.currency.symbol
                    )}
                  </p>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      {extrasModal && (
        <ExtrasModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}
    </div>
  );
}
