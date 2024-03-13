import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
} from 'antd';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import recipeCategory from '../../services/recipeCategory';
import ImageUploadSingle from '../../components/image-upload-single';
import { IMG_URL } from '../../configs/app-global';
import { fetchRecipeCategories } from '../../redux/slices/recipeCategory';
import { useTranslation } from 'react-i18next';
import getTranslationFields from '../../helpers/getTranslationFields';

export default function RecipeCategoryEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);

  const { id } = useParams();
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

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations?.find(
        (el) => el.locale === item.locale
      )?.title,
      [`description[${item.locale}]`]: translations?.find(
        (el) => el.locale === item.locale
      )?.description,
    }));
    return Object.assign({}, ...result);
  }

  const getCategory = (alias) => {
    setLoading(true);
    recipeCategory
      .getById(alias)
      .then((res) => {
        console.log('res', res);
        let category = res.data;
        form.setFieldsValue({
          ...category,
          ...getLanguageFields(category),
          parent_id: category.parent_id || 0,
          image: createImage(category.image),
        });
        setImage(createImage(category.image));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

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
      .update(id, payload)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchRecipeCategories());
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  const onFinishFailed = (values) => console.log(values);

  useEffect(() => {
    if (activeMenu.refetch) {
      getCategory(id);
    }
    fetchAllCategories();
  }, [activeMenu.refetch]);

  return (
    <Card title={t('edit.recipe.category')} extra={<LanguageList />}>
      {!loading ? (
        <Form
          name='basic'
          layout='vertical'
          onFinish={onFinish}
          initialValues={activeMenu.data}
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
                  normalize={(value, prevVal, prevVals) => value.trimStart()}
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
                  normalize={(value, prevVal, prevVals) => value.trimStart()}
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
                <Select>
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
              <Form.Item label={t('image')}>
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
      ) : (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' className='mt-5 pt-5' />
        </div>
      )}
    </Card>
  );
}
