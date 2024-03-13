import React, { useEffect, useState } from 'react';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import Meta from 'antd/es/card/Meta';
import { PlusOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../../helpers/getImage';
import { fetchRestProducts } from '../../../redux/slices/product';
import { toast } from 'react-toastify';
import ProductModal from './product-modal';
import { useTranslation } from 'react-i18next';
import { disableRefetch } from '../../../redux/slices/menu';
import { BsFillGiftFill } from 'react-icons/bs';

export default function ProductCard() {
  const colLg = {
    lg: 8,
    xl: 6,
    xxl: 6,
  };
  const { t } = useTranslation();
  const [extrasModal, setExtrasModal] = useState(null);
  const dispatch = useDispatch();
  const { products, loading, meta, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );
  const { data } = useSelector((state) => state.cart, shallowEqual);
  const { currency } = useSelector((state) => state.cart, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  function onChangePagination(page) {
    dispatch(
      fetchRestProducts({ perPage: 12, page, shop_id: data[0].shop.value })
    );
  }

  const addProductToCart = (item) => {
    if (!currency) {
      toast.warning(t('please.select.currency'));
      return;
    }
    setExtrasModal(item);
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(
        fetchRestProducts({
          perPage: 12,
          currency_id: currency?.id,
          shop_id: data[0]?.shop?.value,
        })
      );
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);
  console.log(products);
  return (
    <div className='px-2'>
      {loading ? (
        <Spin className='d-flex justify-content-center my-5' />
      ) : (
        <Row gutter={12} className='mt-4 product-card'>
          {products.length === 0 ? (
            <div className='d-flex justify-content-center my-5 w-100'>
              <Empty />
            </div>
          ) : (
            products.map((item, index) => (
              <Col {...colLg} key={index}>
                <Card
                  className='products-col'
                  key={item.id}
                  cover={<img alt={item.name} src={getImage(item.img)} />}
                  onClick={() => addProductToCart(item)}
                >
                  <Meta title={item.name} />
                  <div className='preview'>
                    <PlusOutlined />
                  </div>
                  <span className={item.bonus ? 'show-bonus' : 'd-none'}>
                    <BsFillGiftFill /> {item.bonus?.shop_product_quantity}
                    {'+'}
                    {item.bonus?.bonus_quantity}
                  </span>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
      {extrasModal && (
        <ProductModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}
      <div className='d-flex justify-content-end my-5'>
        <Pagination
          total={meta.total}
          current={params.page}
          pageSize={12}
          showSizeChanger={false}
          onChange={onChangePagination}
        />
      </div>
    </div>
  );
}
