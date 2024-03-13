import React, { useEffect, useState } from 'react';
import { Form, PageHeader, Row, Col, Button, Spin } from 'antd';
import '../../assets/scss/page/order-add.scss';
import UserInfo from './user-info';
import DeliveryInfo from './delivery-info';
import ProductInfo from './product-info';
import PreviewInfo from './preview-info';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from '../../services/order';
import moment from 'moment';
import {
  clearOrder,
  setOrderCurrency,
  setOrderData,
  setOrderItems,
} from '../../redux/slices/order';
import { useNavigate, useParams } from 'react-router-dom';
import { disableRefetch, removeFromMenu } from '../../redux/slices/menu';
import { fetchOrders } from '../../redux/slices/orders';
import { useTranslation } from 'react-i18next';
import transactionService from '../../services/transaction';
import DeliveryInfoAdmin from './delivery-info-admin';

export default function OrderEdit() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data, total, coupon, orderProducts } = useSelector(
    (state) => state.order,
    shallowEqual
  );

  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { delivery } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );

  function formatUser(user) {
    return {
      label: user.firstname + ' ' + user.lastname,
      value: user.id,
      uuid: user.uuid,
    };
  }

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then((res) => {
        const order = res.data;
        const items = order.details.flatMap((item) => ({
          ...item.shopProduct,
          quantity: item.quantity,
          img: item.shopProduct.product.img,
        }));
        dispatch(setOrderCurrency(order.currency));
        dispatch(setOrderItems(items));
        dispatch(
          setOrderData({
            userUuid: order.user.uuid,
            shop: getFirstShopFromList(order.shop),
            delivery_time: order.delivery_time,
            delivery_fee: order.delivery_fee,
            payment_type: order.transaction?.payment_system.id,
          })
        );
        form.setFieldsValue({
          delivery_time: data?.delivery_time || '9:00-10:00',
          user: formatUser(order.user),
          currency_id: order.currency.id,
          address: {
            label: order.delivery_address?.address,
            value: order.delivery_address?.id,
          },
          payment_type: {
            label:
              order.transaction?.payment_system?.payment?.translation?.title,
            value: order.transaction?.payment_system.id,
          },
          note: order.note,
          delivery_date: moment(data.delivery_date),
          delivery: {
            label: order.delivery_type.translation?.title,
            value: order.delivery_type.id,
          },
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  function getFirstShopFromList(shops) {
    if (!shops) {
      return null;
    }
    return {
      label: shops.translation?.title,
      value: shops.id,
      open_time: shops.open_time,
      close_time: shops.close_time,
    };
  }

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        setOrderId(res.data.id);
        dispatch(clearOrder());
      })
      .finally(() => setLoadingBtn(false));
  }

  const orderUpdate = (body) => {
    const payment = {
      payment_sys_id: data.payment_type,
    };

    setLoadingBtn(true);
    orderService
      .update(id, body)
      .then((response) => {
        createTransaction(response.data.id, payment);
      })
      .catch(() => setLoadingBtn(false));
  };
  const onFinish = (values) => {
    const totalPrice = data.delivery_fee + total.order_total;
    const body = {
      user_id: values.user?.value,
      total: totalPrice,
      currency_id: values.currency_id,
      rate: currencies.find((item) => item.id === values.currency_id)?.rate,
      shop_id: data.shop.value,
      delivery_id: values.delivery.value,
      delivery_fee: data.delivery_fee,
      coupon: coupon.coupon,
      tax: total.order_tax,
      commission_fee: 1,
      payment_type: values.payment_type.value,
      delivery_time: values.delivery_time,
      note: values.note,
      delivery_date: moment(values.delivery_date).format('YYYY-MM-DD'),
      delivery_address_id: values.address.value,
      delivery_type_id: values.delivery.value,
      total_discount: orderProducts.reduce(
        (total, item) => (total += item.discount),
        0
      ),
      products: orderProducts.map((product) => ({
        shop_product_id: product.id,
        price: product.price,
        qty: product.qty,
        tax: product.tax,
        discount: product.discount,
        total_price: product.total_price,
      })),
    };
    orderUpdate(body);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    const nextUrl = 'orders-board';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    dispatch(fetchOrders());
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  return (
    <>
      <PageHeader
        title={t('edit.order')}
        extra={
          <Button
            type='primary'
            loading={loadingBtn}
            onClick={() => form.submit()}
            disabled={!orderProducts?.length}
          >
            {t('save')}
          </Button>
        }
      />
      <Form
        name='order-form'
        form={form}
        layout='vertical'
        onFinish={onFinish}
        className='order-add'
        initialValues={{
          user: data.user || null,
          address: data.address || null,
          currency_id: data.currency.id,
          payment_type: data.payment_type || null,
        }}
      >
        <Row gutter={24} hidden={loading}>
          <Col span={16}>
            <ProductInfo form={form} />
          </Col>
          <Col span={8}>
            <UserInfo form={form} />
            {delivery === '1' ? (
              <DeliveryInfo form={form} />
            ) : (
              <DeliveryInfoAdmin form={form} />
            )}
          </Col>
        </Row>
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
      </Form>
      {orderId ? (
        <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
      ) : (
        ''
      )}
    </>
  );
}
