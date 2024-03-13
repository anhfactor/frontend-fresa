import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LanguageList from '../../../components/language-list';
import getTranslationFields from '../../../helpers/getTranslationFields';
import Map from '../../../components/map';
import branchService from '../../../services/seller/branch';
import { fetchBranch } from '../../../redux/slices/branch';
import getDefaultLocation from '../../../helpers/getDefaultLocation';
import AddressInput from "../../../components/address-input";

const SellerBranchEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );
  const [location, setLocation] = useState(getDefaultLocation(settings));
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
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

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const getBranch = (id) => {
    setLoading(true);
    branchService
      .getById(id)
      .then((res) => {
        let branch = res.data;
        setLocation({
          lat: Number(branch.latitude),
          lng: Number(branch.longitude),
        });
        form.setFieldsValue({
          ...branch,
          ...getLanguageFields(branch),
        });
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
        setLoading(false);
      });
  };

  const onFinish = (values) => {
    const body = {
      title: getTranslationFields(languages, values, 'title'),
      address: getTranslationFields(languages, values, 'address'),
      longitude: location.lng,
      latitude: location.lat,
    };
    setLoadingBtn(true);
    const nextUrl = 'seller/branch';
    branchService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchBranch());
      })
      .finally(() => setLoadingBtn(false));
    console.log('body', body);
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      getBranch(id);
    }
  }, [activeMenu.refetch]);

  return (
    <Card title={t('add.branch')} className='h-100' extra={<LanguageList />}>
      <Form
        name='branch-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ clickable: true, ...activeMenu.data }}
        className='d-flex flex-column h-100'
      >
        {loading ? (
          <div className='d-flex justify-content-center align-items-center'>
            <Spin size='large' className='py-5' />
          </div>
        ) : (
          <Row gutter={12}>
            <Col span={12}>
              {languages.map((item, idx) => (
                <Form.Item
                  key={'title' + idx}
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
              {languages.map((item, idx) => (
                  <AddressInput
                      setLocation={setLocation}
                      form={form}
                      item={item}
                      idx={idx}
                      defaultLang={defaultLang}
                  />
              ))}
            </Col>
            <Col span={24}>
              <Map
                location={location}
                setLocation={setLocation}
                setAddress={(value) =>
                  form.setFieldsValue({ [`address[${defaultLang}]`]: value })
                }
              />
            </Col>
          </Row>
        )}

        <div className='flex-grow-1 d-flex flex-column justify-content-end'>
          <div className='pb-5'>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default SellerBranchEdit;
