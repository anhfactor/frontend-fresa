import React, { useEffect, useState } from 'react';
import { Button, Col, Form, InputNumber, Row, Select, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import extraService from '../../services/extra';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import productService from '../../services/product';
import { setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { IMG_URL } from '../../configs/app-global';
import { useParams } from 'react-router-dom';

const ProductStock = ({ prev, next }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [extraValues, setExtraValues] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(null);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const { stocks } = values;
    let extras;
    const isProductWithExtras = !!activeMenu.data?.extras?.length;

    if (isProductWithExtras) {
      extras = stocks.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        id: activeMenu.data?.extras.map((el, idx) => item[`extras[${idx}]`]),
      }));
    } else {
      extras = [
        {
          price: stocks[0].price,
          quantity: stocks[0].quantity,
        },
      ];
    }

    productService
      .stocks(uuid, { extras })
      .then(() => next())
      .finally(() => setLoadingBtn(false));
  };

  function fetchExtraValues() {
    extraService.getAllValues().then(({ data }) => setExtraValues(data));
  }

  useEffect(() => {
    fetchExtraValues();
    form.setFieldsValue({
      stocks: activeMenu.data?.stocks?.length ? activeMenu.data?.stocks : [''],
    });
  }, []);

  function addToMenu() {
    const extras = form.getFieldsValue(true);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, stocks: extras.stocks },
      })
    );
  }

  function getExtrasName(extrasId) {
    const extraItem = extraValues.find(
      (item) => item.extra_group_id === extrasId
    );
    return extraItem?.group?.translation?.title;
  }

  return (
    <Form layout='vertical' form={form} onFinish={onFinish}>
      <Form.List name='stocks'>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Row
                  key={field.key}
                  gutter={12}
                  align='middle'
                  style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
                  hidden={!activeMenu.data?.extras?.length && field.key}
                >
                  <Col>
                    <Form.Item
                      label={t('price')}
                      name={[index, 'price']}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber
                        className='w-100'
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      label={t('quantity')}
                      name={[index, 'quantity']}
                      rules={[{ required: true, message: t('required') }]}
                    >
                      <InputNumber
                        className='w-100'
                        style={{ minWidth: 200 }}
                      />
                    </Form.Item>
                  </Col>
                  {activeMenu.data?.extras?.map((item, idx) => (
                    <Col key={'extra' + item}>
                      <Form.Item
                        label={getExtrasName(item)}
                        name={[index, `extras[${idx}]`]}
                        rules={[{ required: true, message: t('required') }]}
                      >
                        <Select className='w-100' style={{ minWidth: 200 }}>
                          {extraValues
                            .filter((el) => el.extra_group_id === item)
                            .map((el) => (
                              <Select.Option key={el.id} value={el.id}>
                                <Space>
                                  {el.group.type === 'color' && (
                                    <div
                                      className='extra-color-wrapper-contain'
                                      style={{ backgroundColor: el.value }}
                                    />
                                  )}
                                  {el.group.type === 'image' ? null : el.value}
                                  {el.group.type === 'image' && (
                                    <img
                                      src={IMG_URL + el.value}
                                      alt={el.value}
                                      className='extra-img-wrapper-contain'
                                    />
                                  )}
                                </Space>
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  ))}
                  <Col>
                    {field.key ? (
                      <Button
                        type='primary'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    ) : (
                      ''
                    )}
                  </Col>
                </Row>
              ))}
              {activeMenu.data?.extras?.length ? (
                <Button
                  type='dashed'
                  style={{ width: '100%' }}
                  onClick={() => {
                    add();
                    addToMenu();
                  }}
                >
                  <Space>
                    <PlusOutlined />
                    {t('add')}
                  </Space>
                </Button>
              ) : (
                ''
              )}
            </div>
          );
        }}
      </Form.List>
      <Space className='mt-4'>
        <Button onClick={prev}>{t('prev')}</Button>
        <Button type='primary' htmlType='submit' loading={!!loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};

export default ProductStock;
