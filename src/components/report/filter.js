import { Col, DatePicker, Row, Select, Space } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ReportContext } from '../../context/report';
import { fetchShopsWithSeller } from '../../redux/slices/shop';
const { RangePicker } = DatePicker;

const FilterByDate = () => {
  const dispatch = useDispatch();
  const { shopWithSeller } = useSelector((state) => state.shop, shallowEqual);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const {
    date_from,
    date_to,
    handleDateRange,
    filterOptions,
    setDateFrom,
    setDateTo,
    setSellers,
    setShops,
    sellers,
    shops,
  } = useContext(ReportContext);

  const onChange = (value) => {
    const range = value.split(',');
    setDateFrom(range[0]);
    setDateTo(range[1]);
  };
  const handleByShop = (value) => {
    setShops(value);
  };
  const handleBySeller = (value) => {
    setSellers(value);
  };
  useEffect(() => {
    if (
      (!shopWithSeller?.shops.length || !shopWithSeller?.seller.length) &&
      user.role !== 'seller'
    )
      dispatch(fetchShopsWithSeller());
  }, []);

  return (
    <Row gutter={24} className='mb-3'>
      <Col span={24}>
        <Space size='large'>
          <Select
            value={`${date_from},${date_to}`}
            style={{ width: 150 }}
            placeholder='Select date range'
            onChange={onChange}
            options={filterOptions}
          />
          {Boolean(user.role === 'admin') && (
            <>
              <Select
                showSearch
                style={{ minWidth: 150 }}
                mode='multiple'
                defaultValue={shops}
                placeholder='Filter by shop'
                onChange={handleByShop}
                options={shopWithSeller?.shops || []}
                filterOption={(input, option) =>
                  (option?.label ?? '').includes(input)
                }
              />
              {/* 
              <Select
                showSearch
                style={{ minWidth: 150 }}
                mode='multiple'
                defaultValue={sellers}
                placeholder='Filter by seller'
                onChange={handleBySeller}
                options={shopWithSeller?.seller || []}
                filterOption={(input, option) =>
                  (option?.label.toUpperCase() ?? '').includes(
                    input.toUpperCase()
                  )
                }
              /> */}
            </>
          )}
          <RangePicker
            defaultValue={[moment(date_from), moment(date_to)]}
            onChange={handleDateRange}
            disabledDate={(current) => moment().add(0, 'days') <= current}
          />
        </Space>
      </Col>
    </Row>
  );
};

export default FilterByDate;
