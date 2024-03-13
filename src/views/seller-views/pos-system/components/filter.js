import React, { useState } from 'react';
import { Card, Col, Row } from 'antd';
import { DebounceSelect } from '../../../../components/search';
import brandService from '../../../../services/rest/brand';
import categoryService from '../../../../services/rest/category';
import useDidUpdate from '../../../../helpers/useDidUpdate';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchRestProducts } from '../../../../redux/slices/product';
import SearchInput from '../../../../components/search-input';
import { useTranslation } from 'react-i18next';

const Filter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState(null);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);

  async function fetchUserBrand(username) {
    return brandService.search(username).then((res) =>
      res.data.map((item) => ({
        label: item.brand.title,
        value: item.brand.id,
      }))
    );
  }

  async function fetchUserCategory(search) {
    const params = { search };
    return categoryService.getChild(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation !== null ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  useDidUpdate(() => {
    const params = {
      brand_id: brand?.value,
      category_id: category?.value,
      search,
      shop_id: shop?.id,
    };
    dispatch(fetchRestProducts(params));
  }, [brand, category, shop, search]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={12}>
          <SearchInput
            placeholder={t('search')}
            handleChange={setSearch}
            style={{}}
          />
        </Col>
        <Col span={5}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.category')}
            fetchOptions={fetchUserCategory}
            onChange={(value) => setCategory(value)}
            value={category}
          />
        </Col>
        <Col span={5}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.brand')}
            fetchOptions={fetchUserBrand}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default Filter;
