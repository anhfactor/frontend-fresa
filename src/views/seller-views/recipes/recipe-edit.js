import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Spin,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { fetchRecipes } from '../../../redux/slices/recipe';
import productService from '../../../services/seller/product';
import { DebounceSelect } from '../../../components/search';
import recipeService from '../../../services/seller/recipe';
import { IMG_URL } from '../../../configs/app-global';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../../components/language-list';
import getTranslationFields from '../../../helpers/getTranslationFields';
import { AsyncTreeSelect } from '../../../components/async-tree-select';
import ImageUploadSingle from '../../../components/image-upload-single';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function RecipeEdit() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const createImage = (item) => {
    if (!item) {
      return null;
    }
    return {
      uid: item,
      name: item,
      url: IMG_URL + item,
      className: '',
    };
  };

  function getLanguageFields(data) {
    if (!data?.translations) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
    }));
    return Object.assign({}, ...result);
  }

  const getRecipe = (alias) => {
    setLoading(true);
    recipeService
      .getById(alias)
      .then((res) => {
        let recipe = res.data;
        console.log('recipe', recipe);
        form.setFieldsValue({
          ...recipe,
          ...getLanguageFields(recipe),
          image: createImage(recipe.image),
          recipe_category: {
            label: recipe.category.translation?.title,
            value: recipe.category?.id,
          },
          nutrition: recipe.nutritions.map((item) => ({
            ...item,
            ...getLanguageFields(item),
          })),
          instruction: recipe.instructions.map((item) => ({
            ...getLanguageFields(item),
          })),
          products: recipe.products?.map((item, idx) => ({
            product: {
              label: item.shopProduct.product.translation?.title,
              value: item.shopProduct.product.id,
            },
            measurement: item.measurement,
          })),
        });
        setImage(createImage(recipe.image));
      })
      .finally(() => dispatch(setLoading(false)));
  };

  const onFinish = (values) => {
    const body = {
      recipe_category_id: values.recipe_category.value,
      active_time: values.active_time,
      total_time: values.total_time,
      calories: values.calories,
      image: image?.name,
      title: getTranslationFields(languages, values),
      nutrition: values.nutrition.map((item) => ({
        weight: item.weight,
        percentage: item.percentage,
        title: getTranslationFields(languages, item),
      })),
      instruction: values.instruction.map((item) => ({
        title: getTranslationFields(languages, item),
      })),
      products: values.products.map((item) => ({
        measurement: item.measurement,
        product_id: item.product.value,
      })),
    };
    setLoadingBtn(true);
    const nextUrl = 'seller/recipes';
    recipeService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchRecipes());
      })
      .finally(() => setLoadingBtn(false));
  };

  async function fetchProducts(search) {
    const params = {
      search,
      perPage: 10,
    };
    return productService
      .selectProduct(params)
      .then((res) => formatProducts(res.data));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      getRecipe(id);
    }
  }, [activeMenu.refetch]);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.product.translation?.title,
      value: item.id,
    }));
  }

  async function fetchRecipeCategories() {
    const params = {
      perPage: 1000,
    };
    return recipeService
      .getAllCategories(params)
      .then((res) => formatCategories(res.data));
  }

  function formatCategories(data) {
    return data.map((item) => ({
      label: item.translation?.title,
      value: item.id,
      children: item.child?.length ? formatCategories(item.child) : [],
      disabled: !item.parent_id,
    }));
  }

  return (
    <Card title={t('edit.recipe')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <Form
          name='recipe-edit'
          layout='vertical'
          onFinish={onFinish}
          form={form}
          initialValues={activeMenu.data}
        >
          <Row gutter={12}>
            <Col span={12}>
              {languages.map((item) => (
                <Form.Item
                  key={'title' + item.id}
                  label={t('title')}
                  name={`title[${item.locale}]`}
                  rules={[
                    {
                      required: item.locale === defaultLang,
                      message: t('required'),
                    },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <Input />
                </Form.Item>
              ))}
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('recipe.category')}
                name='recipe_category'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <AsyncTreeSelect
                  fetchOptions={fetchRecipeCategories}
                  debounceTimeout={200}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={`${t('active.time')} (${t('minutes')})`}
                name='active_time'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={`${t('total.time')} (${t('minutes')})`}
                name='total_time'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('calories')}
                name='calories'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <InputNumber min={0} className='w-100' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('image')} name='image'>
                <ImageUploadSingle
                  type='products'
                  image={image}
                  setImage={setImage}
                  form={form}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <h4>{t('nutritions')}</h4>
              <Form.List name='nutrition'>
                {(fields, { add, remove }) => {
                  return (
                    <div className='mb-5'>
                      {fields.map((field, index) => (
                        <Row key={field.key} gutter={12}>
                          <Col>
                            <h5
                              className='d-flex align-items-end mb-4'
                              style={{ lineHeight: '40px' }}
                            >
                              <span>{index + 1}.</span>
                            </h5>
                          </Col>
                          <Col span={10}>
                            {languages.map((item) => (
                              <Form.Item
                                key={'title' + item.id + index}
                                name={[index, `title[${item.locale}]`]}
                                rules={[
                                  {
                                    required: item.locale === defaultLang,
                                    message: t('required'),
                                  },
                                ]}
                                hidden={item.locale !== defaultLang}
                              >
                                <Input placeholder={t('title')} />
                              </Form.Item>
                            ))}
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              name={[index, 'weight']}
                              rules={[
                                { required: true, message: t('required') },
                              ]}
                            >
                              <Input placeholder={t('weight')} />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              name={[index, 'percentage']}
                              rules={[
                                { required: true, message: t('required') },
                              ]}
                            >
                              <Input placeholder={t('percentage')} />
                            </Form.Item>
                          </Col>
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
                      <Button
                        type='dashed'
                        style={{ width: '100%' }}
                        onClick={() => add()}
                      >
                        <Space>
                          <PlusOutlined />
                          {t('add.nutrition')}
                        </Space>
                      </Button>
                    </div>
                  );
                }}
              </Form.List>
            </Col>

            <Col span={24}>
              <h4>{t('instructions')}</h4>
              <Form.List name='instruction'>
                {(fields, { add, remove }) => {
                  return (
                    <div className='mb-5'>
                      {fields.map((field, index) => (
                        <Row key={field.key} gutter={12}>
                          <Col>
                            <h5
                              className='d-flex align-items-end mb-4'
                              style={{ lineHeight: '40px' }}
                            >
                              <span>{index + 1}.</span>
                            </h5>
                          </Col>
                          <Col span={22}>
                            {languages.map((item) => (
                              <Form.Item
                                key={'title' + item.id + index}
                                name={[index, `title[${item.locale}]`]}
                                rules={[
                                  {
                                    required: item.locale === defaultLang,
                                    message: t('required'),
                                  },
                                ]}
                                hidden={item.locale !== defaultLang}
                              >
                                <Input placeholder={t('title')} />
                              </Form.Item>
                            ))}
                          </Col>
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
                      <Button
                        type='dashed'
                        style={{ width: '100%' }}
                        onClick={() => add()}
                      >
                        <Space>
                          <PlusOutlined />
                          {t('add.instruction')}
                        </Space>
                      </Button>
                    </div>
                  );
                }}
              </Form.List>
            </Col>

            <Col span={24}>
              <h4>{t('products')}</h4>
              <Form.List name='products'>
                {(fields, { add, remove }) => {
                  return (
                    <div className='mb-5'>
                      {fields.map((field, index) => (
                        <Row key={field.key} gutter={12}>
                          <Col>
                            <h5
                              className='d-flex align-items-end mb-4'
                              style={{ lineHeight: '40px' }}
                            >
                              <span>{index + 1}.</span>
                            </h5>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              name={[index, 'product']}
                              rules={[
                                { required: true, message: t('required') },
                              ]}
                            >
                              <DebounceSelect
                                placeholder={t('product')}
                                fetchOptions={fetchProducts}
                                debounceTimeout={200}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              name={[index, 'measurement']}
                              rules={[
                                { required: true, message: t('required') },
                              ]}
                            >
                              <InputNumber
                                placeholder={t('measurement')}
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
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
                      <Button
                        type='dashed'
                        style={{ width: '100%' }}
                        onClick={() => add()}
                      >
                        <Space>
                          <PlusOutlined />
                          {t('add.product')}
                        </Space>
                      </Button>
                    </div>
                  );
                }}
              </Form.List>
            </Col>
          </Row>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('submit')}
          </Button>
        </Form>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
}
