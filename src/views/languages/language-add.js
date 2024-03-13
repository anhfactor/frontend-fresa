import React, { useEffect, useState } from 'react';
import { Input, Form, Row, Col, Button, Card, Switch } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import languagesService from '../../services/languages';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import createImage from '../../helpers/createImage';
import ImageUploadSingle from '../../components/image-upload-single';
import Loading from '../../components/loading';
import { fetchLang } from '../../redux/slices/languages';

export default function LanguageAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [image, setImage] = useState(activeMenu?.data?.image || null);

  const fetchLanguage = (id) => {
    setLoading(true);
    languagesService
      .getById(id)
      .then((res) => {
        let language = res.data;
        setImage(createImage(language.img));
        form.setFieldsValue({
          ...language,
          image: createImage(language.img),
        });
      })
      .finally(() => setLoading(false));
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const payload = {
      title: values.title,
      locale: values.locale,
      images: [image?.name],
      active: Number(values.active),
      backward: Number(values.backward),
      default: Number(values.default),
    };
    console.log('payload => ', payload);
    const nextUrl = 'settings/languages';
    if (!id) {
      languagesService
        .create(payload)
        .then(() => {
          dispatch(fetchLang());
          toast.success(t('successfully.created'));
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    } else {
      languagesService
        .update(id, payload)
        .then(() => {
          dispatch(fetchLang());
          toast.success(t('successfully.updated'));
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
        })
        .finally(() => setLoadingBtn(false));
    }
  };

  useEffect(() => {
    if (id) {
      fetchLanguage(id);
    }
  }, [id]);

  return (
    <Card title={id ? t('edit.language') : t('add.language')}>
      {!loading ? (
        <Form form={form} name='form' layout='vertical' onFinish={onFinish}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={t('title')}
                name='title'
                rules={[{ required: true, message: t('required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('short.code')}
                name='locale'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t('image')}
                name='image'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <ImageUploadSingle
                  type='languages'
                  image={image}
                  setImage={setImage}
                  form={form}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t('active')}
                name='active'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='RTL' name='backward' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t('default')}
                name='default'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
        </Form>
      ) : (
        <Loading />
      )}
    </Card>
  );
}
