import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchGroups } from '../../redux/slices/group';
import groupService from '../../services/group';
import getTranslationFields from '../../helpers/getTranslationFields';
import LanguageList from '../../components/language-list';

const GroupAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    const body = {
      title: getTranslationFields(languages, values),
      status: values.status,
    };
    setLoadingBtn(true);
    const nextUrl = 'catalog/groups';
    groupService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchGroups({}));
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('add.group')} extra={<LanguageList />}>
      <Form
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ status: true, ...activeMenu.data }}
      >
        <Row gutter={12}>
          <Col span={12}>
            {languages.map((item) => (
              <Form.Item
                key={'title' + item.locale}
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

          <Col span={6}>
            <div className='col-md-12 col-sm-6'>
              <Form.Item
                label={t('active')}
                name='status'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Button
          type='primary'
          htmlType='submit'
          loading={loadingBtn}
          disabled={setLoadingBtn}
        >
          {t('submit')}
        </Button>
      </Form>
    </Card>
  );
};

export default GroupAdd;
