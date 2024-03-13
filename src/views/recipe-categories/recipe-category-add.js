import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Switch } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import recipeCategory from '../../services/recipeCategory';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchRecipeCategories } from '../../redux/slices/recipeCategory';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../helpers/getTranslationFields';

export default function RecipeCategoryAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);

  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const fetchAllCategories = () => {
    const params = { perPage: 1000 };
    recipeCategory.getAll(params).then((res) => setAllCategories(res.data));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const payload = {
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
      status: values.status,
      image: image?.name,
      parent_id: values.parent_id || undefined,
    };
    const nextUrl = 'catalog/recipe-categories';
    recipeCategory
      .create(payload)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchRecipeCategories());
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  const onFinishFailed = (values) => console.log(values);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  return (
    <Card title={t('add.recipe.category')} extra={<LanguageList />}>
      <Form
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{ parent_id: 0, status: true, ...activeMenu.data }}
        form={form}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item, index) => (
              <Form.Item
                key={item.title + index}
                label={t('title')}
                name={`title[${item.locale}]`}
                help={
                  error
                    ? error[`title.${defaultLang}`]
                      ? error[`title.${defaultLang}`][0]
                      : null
                    : null
                }
                validateStatus={error ? 'error' : 'success'}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
                normalize={(value, prevVal, prevVals) => value.trim()}
              >
                <Input />
              </Form.Item>
            ))}
          </Col>

          <Col span={12}>
            {languages.map((item, index) => (
              <Form.Item
                key={item.locale + index}
                label={t('description')}
                name={`description[${item.locale}]`}
                rules={[
                  {
                    required: item.locale === defaultLang,
                    message: t('required'),
                  },
                ]}
                hidden={item.locale !== defaultLang}
                normalize={(value, prevVal, prevVals) => value.trim()}
              >
                <TextArea rows={4} />
              </Form.Item>
            ))}
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('parent.category')}
              name='parent_id'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select placeholder={t('please.select')}>
                <Select.Option value={0}>---</Select.Option>
                {allCategories.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.translation?.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}></Col>
          <Col span={4}>
            <Form.Item
              label={t('image')}
              name='image'
              rules={[{ required: true, message: t('required') }]}
            >
              <ImageUploadSingle
                type='categories'
                image={image}
                setImage={setImage}
                form={form}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item
              label={t('active')}
              name='status'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Form>
    </Card>
  );
}
