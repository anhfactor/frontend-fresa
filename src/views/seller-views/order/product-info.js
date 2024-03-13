import React, { useState } from 'react';
import { Card, Empty, Space, Spin } from 'antd';
import brandService from '../../../services/rest/brand';
import categoryService from '../../../services/rest/category';
import Meta from 'antd/lib/card/Meta';
import getImage from '../../../helpers/getImage';
import { PlusOutlined } from '@ant-design/icons';
import OrderItems from './orderItems';
import { DebounceSelect } from '../../../components/search';
import SearchInput from '../../../components/search-input';
import ExtrasModal from './extrasModal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchRestProducts } from '../../../redux/slices/product';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { BsFillGiftFill } from 'react-icons/bs';

const ProductInfo = ({ form }) => {
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState(null);
  const [extrasModal, setExtrasModal] = useState(null);

  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.order, shallowEqual);
  const { products, loading } = useSelector(
    (state) => state.product,
    shallowEqual
  );
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  useDidUpdate(() => {
    const params = {
      perPage: 10,
      page: 1,
      brand_id: brand?.value,
      category_id: category?.value,
      shop_id: shop.id,
      search,
    };
    dispatch(fetchRestProducts(params));
  }, [brand, category, search]);

  async function fetchBrands(search) {
    return brandService.search(search).then(({ data }) =>
      data.map((item) => ({
        label: item.brand.title,
        value: item.id,
      }))
    );
  }

  async function fetchCategories(search) {
    const params = { search };
    return categoryService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  const addProductToCart = (item) => {
    if (!data.currency) {
      toast.warning('Please, select currency');
      return;
    }
    setExtrasModal(item);
  };

  return (
    <Card
      title='Order details'
      extra={
        <Space>
          <DebounceSelect
            placeholder='Select category'
            fetchOptions={fetchCategories}
            style={{ minWidth: 150 }}
            onChange={(value) => setCategory(value)}
            value={category}
          />
          <DebounceSelect
            placeholder='Select brand'
            fetchOptions={fetchBrands}
            style={{ minWidth: 150 }}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Space>
      }
    >
      <div className='d-flex justify-content-end mb-4'>
        <SearchInput placeholder='Search...' handleChange={setSearch} />
      </div>
      <div className='products-row order-items'>
        {products.length ? (
          products.map((item) => (
            <Card
              className='products-col'
              key={item.id}
              cover={
                <img alt={item.translation?.title} src={getImage(item.img)} />
              }
              onClick={() => addProductToCart(item)}
            >
              <Meta
                title={item.translation?.title}
                description={item.stock?.price}
              />
              <div className='preview'>
                <PlusOutlined />
              </div>
              <span className={item.bonus ? 'show-bonus' : 'd-none'}>
                <BsFillGiftFill /> {item.bonus?.shop_product_quantity}
                {'+'}
                {item.bonus?.bonus_quantity}
              </span>
            </Card>
          ))
        ) : (
          <div className='d-flex align-items-center justify-content-center w-100'>
            <Empty />
          </div>
        )}
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
      </div>
      {extrasModal && (
        <ExtrasModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}

      <OrderItems form={form} />
    </Card>
  );
};

export default ProductInfo;
