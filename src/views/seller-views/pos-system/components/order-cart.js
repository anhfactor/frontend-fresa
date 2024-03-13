import React, { useEffect, useState } from 'react';
import {
  CheckOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Image, Input, Row, Space, Spin } from 'antd';
import '../../../../assets/scss/components/pos-tabs.scss';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  clearCart,
  removeFromCart,
  reduceCart,
  setCartShops,
  clearCartShops,
  setCartTotal,
  addCoupon,
  verifyCoupon,
  removeBag,
  setCartCashback,
} from '../../../../redux/slices/cart';
import shopService from '../../../../services/seller/shop';
import getImage from '../../../../helpers/getImage';
import useDidUpdate from '../../../../helpers/useDidUpdate';
import orderService from '../../../../services/seller/order';
import invokableService from '../../../../services/rest/invokable';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../../../helpers/numberToPrice';
import {
  calculateTotalCoupon,
  getCartData,
  getCartItems,
} from '../../../../redux/selectors/cartSelector';
import DeliveryModal from './delivery-modal';
import PreviewInfo from './preview-info';
import { toast } from 'react-toastify';
import { fetchRestProducts } from '../../../../redux/slices/product';
import useDebounce from '../../../../helpers/useDebounce';
import Payment from '../../../seller-views/pos-system/payments/payment';

export default function OrderCart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { cartItems, cartShops, currentBag, total, coupons, currency } =
    useSelector((state) => state.cart, shallowEqual);
  const filteredCartItems = useSelector((state) => getCartItems(state.cart));
  const data = useSelector((state) => getCartData(state.cart));
  const totalCoupon = useSelector((state) => calculateTotalCoupon(state.cart));
  const [paymentModal, setPaymentModal] = useState(null);
  const [shops, setShops] = useState([]);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(null);
  const debouncedCartItems = useDebounce(cartItems, 300);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const deleteCard = (e) => dispatch(removeFromCart(e));

  const clearAll = () => {
    dispatch(clearCart());
    if (currentBag !== 0) {
      dispatch(removeBag(currentBag));
    }
  };
  const increment = (item) => {
    if (item.quantity === item?.current_qty) {
      return;
    }
    if (item.quantity === item.max_qty) {
      return;
    }
    dispatch(addToCart({ ...item, quantity: 1 }));
  };
  const decrement = (item) => {
    if (item.quantity === 1) {
      return;
    }
    if (item.quantity <= item.min_qty) {
      return;
    }
    dispatch(reduceCart({ ...item, quantity: 1 }));
  };

  function getShops() {
    shopService.get().then((res) => setShops([res.data]));
  }

  useEffect(() => {
    getShops();
  }, []);

  function formatProducts(list) {
    const result = list.map((item, index) => ({
      [`products[${index}][id]`]: item.id,
      [`products[${index}][quantity]`]: item.quantity,
    }));
    return Object.assign({}, ...result);
  }

  useDidUpdate(() => {
    dispatch(
      fetchRestProducts({
        perPage: 12,
        currency_id: currency.id,
        shop_id: shop.id,
      })
    );
    if (filteredCartItems.length) {
      productCalculate();
    }
  }, [currency]);

  useDidUpdate(() => {
    if (filteredCartItems.length) {
      productCalculate();
    } else {
      dispatch(clearCartShops());
    }
  }, [debouncedCartItems, currentBag]);

  function productCalculate() {
    const products = formatProducts(filteredCartItems);
    const params = {
      currency_id: currency.id,
      ...products,
    };
    setLoading(true);
    orderService
      .calculate(params)
      .then(({ data }) => {
        console.log('data', data);
        let list = [];
        const items = data.products.map((item) => ({
          ...filteredCartItems.find((el) => el.id === item.id),
          ...item,
        }));
        shops.forEach((shop) => {
          let shopObj = {
            ...shop,
            products: [],
          };
          items.forEach((item) => {
            if (item.shop_id === shop.id) {
              shopObj.products.push(item);
            }
          });
          list.push(shopObj);
        });
        const shopList = list.filter((item) => item.products.length);
        dispatch(setCartShops(shopList));
        const orderData = {
          product_total: data.product_total,
          product_tax: data.product_tax,
          order_tax: data.order_tax,
          order_total: data.order_total,
        };
        dispatch(setCartTotal(orderData));
        calculateCashback(data.order_total);
      })
      .finally(() => setLoading(false));
  }

  function calculateCashback(amount) {
    const payload = { amount };
    invokableService
      .checkCashback(payload)
      .then(({ data }) => dispatch(setCartCashback(data.price)));
  }

  const handleSave = (id) => {
    setDeliveryModal(false);
    setPaymentModal(null);
    setOrderId(id);
    dispatch(
      fetchRestProducts({
        perPage: 12,
        currency_id: currency?.id,
        shop_id: shop.id,
      })
    );
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    clearAll();
    toast.success(t('successfully.closed'));
  };

  function handleCheckCoupon(shopId) {
    let coupon = coupons.find((item) => item.shop_id === shopId);
    if (!coupon) {
      return;
    }
    setLoadingCoupon(shopId);
    invokableService
      .checkCoupon(coupon)
      .then((res) =>
        dispatch(
          verifyCoupon({
            shop_id: shopId,
            price: res.data.price,
            verified: true,
          })
        )
      )
      .catch(() =>
        dispatch(
          verifyCoupon({
            shop_id: shopId,
            price: 0,
            verified: false,
          })
        )
      )
      .finally(() => setLoadingCoupon(null));
  }

  const orderCreate = () => {
    if (!data.user) {
      toast.warning(t('please.select.client'));
      return;
    }
    if (!data.address) {
      toast.warning(t('please.select.client.address'));
      return;
    }
    if (!data.paymentType) {
      toast.warning(t('please.select.payment.type'));
      return;
    }
    setDeliveryModal(true);
  };

  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div className='card-save'>
        {cartShops?.map((shop) => (
          <div key={shop.uuid}>
            <div className='all-price'>
              <span className='title'>
                {shop.translation?.title} {t('shop')}
              </span>
              <span className='counter'>
                {shop.products.length}{' '}
                {shop.products.length > 1 ? t('products') : t('product')}
              </span>
            </div>
            {shop.products.map((item) => (
              <div className='custom-cart-container' key={item.id}>
                <Row className='product-row'>
                  <Image
                    width={70}
                    height='auto'
                    src={getImage(item.product?.img)}
                    preview
                    placeholder
                    className='rounded'
                  />
                  <Col span={18} className='product-col'>
                    <div>
                      <span className='product-name'>
                        {item.product?.translation?.title}
                      </span>
                      <div className='mt-2'>
                        <Space>
                          {item?.stock?.extras.map((el) => {
                            if (el.group.type === 'color') {
                              return (
                                <span
                                  className='extras-color'
                                  style={{ backgroundColor: el.value }}
                                />
                              );
                            } else if (el.group.type === 'text') {
                              return (
                                <span className='extras-text rounded'>
                                  {el.value}
                                </span>
                              );
                            }
                            return (
                              <img
                                src={getImage(el.value)}
                                alt='extra'
                                className='extras-image rounded'
                              />
                            );
                          })}
                        </Space>
                      </div>
                      <div className='product-counter'>
                        <span>
                          {numberToPrice(
                            item.price_without_tax,
                            currency.symbol
                          )}
                        </span>

                        <div className='count'>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<MinusOutlined size={14} />}
                            onClick={() => decrement(item)}
                          />
                          <span>{item.quantity}</span>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<PlusOutlined size={14} />}
                            onClick={() => increment(item)}
                          />
                          <Button
                            className='button-counter'
                            shape='circle'
                            onClick={() => deleteCard(item)}
                            icon={<DeleteOutlined size={14} />}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
            <div className='d-flex my-3'>
              <Input
                placeholder={t('coupon')}
                className='w-100 mr-2'
                addonAfter={
                  coupons.find((el) => el.shop_id === shop.id)?.verified ? (
                    <CheckOutlined style={{ color: '#18a695' }} />
                  ) : null
                }
                defaultValue={
                  coupons.find((el) => el.shop_id === shop.id)?.coupon
                }
                onBlur={(event) =>
                  dispatch(
                    addCoupon({
                      coupon: event.target.value,
                      user_id: data.user?.value,
                      shop_id: shop.id,
                      verified: false,
                    })
                  )
                }
              />
              <Button
                onClick={() => handleCheckCoupon(shop.id)}
                loading={loadingCoupon === shop.id}
              >
                {t('check.coupon')}
              </Button>
            </div>
          </div>
        ))}

        <Row className='all-price-row'>
          <Col span={24} className='col'>
            <div className='all-price-container'>
              <span>{t('sub.total')}</span>
              <span>{numberToPrice(total.product_total, currency.symbol)}</span>
            </div>
            <div className='all-price-container'>
              <span>{t('product.tax')}</span>
              <span>{numberToPrice(total.product_tax, currency.symbol)}</span>
            </div>
            <div className='all-price-container'>
              <span>{t('shop.tax')}</span>
              <span>{numberToPrice(total.order_tax, currency.symbol)}</span>
            </div>
            <div className='all-price-container'>
              <span>{t('cashback')}</span>
              <span>{numberToPrice(total?.cashback, currency.symbol)}</span>
            </div>
          </Col>
        </Row>

        <Row className='submit-row'>
          <Col span={14} className='col'>
            <span>{t('total.amount')}</span>
            <span>{numberToPrice(total.order_total, currency.symbol)}</span>
          </Col>
          <Col className='col2'>
            <Button
              type='primary'
              onClick={orderCreate}
              disabled={!cartShops.length}
            >
              {t('place.order')}
            </Button>
          </Col>
        </Row>
      </div>
      {paymentModal && (
        <Payment
          visibility={paymentModal}
          handleCancel={() => setPaymentModal(null)}
          handleSave={handleSave}
        />
      )}
      {deliveryModal && (
        <DeliveryModal
          handleOpenPayment={setPaymentModal}
          visibility={deliveryModal}
          handleCancel={() => setDeliveryModal(false)}
          handleSave={handleSave}
        />
      )}
      {orderId ? (
        <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
      ) : (
        ''
      )}
    </Card>
  );
}
