import React, { useEffect, useState } from 'react';
import { Button, Form, Card, Space } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/scss/components/shops-add.scss';
import ShopAddData from './shop-add-data';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  replaceMenu,
  setMenuData,
} from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import shopService from '../../services/shop';
import { IMG_URL } from '../../configs/app-global';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from '../../helpers/getDefaultLocation';
import Loading from 'components/loading';

const CreateShop = ({ next }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locationPath = useLocation();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );
  const [location, setLocation] = useState(getDefaultLocation(settings));
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(
    activeMenu?.data?.logo_img ? [activeMenu?.data?.logo_img] : []
  );
  const [backImage, setBackImage] = useState(
    activeMenu?.data?.background_img ? [activeMenu?.data?.background_img] : []
  );
  const is_clone = locationPath?.pathname.includes('shop-clone');
  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data?.open_time);
      data.close_time = JSON.stringify(data?.close_time);
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
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.description,
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  const fetchShop = (uuid) => {
    setLoading(true);
    shopService
      .getById(uuid)
      .then(({ data }) => {
        form.setFieldsValue({
          ...data,
          ...getLanguageFields(data),
          logo_image: createImage(data.logo_img),
          background_img: createImage(data.background_img),
          delivery_time_type: data.delivery_time?.type,
          delivery_time_from: data.delivery_time?.from,
          delivery_time_to: data.delivery_time?.to,
          user: {
            value: data.seller.id,
            label: data.seller.firstname + ' ' + data.seller.lastname,
          },
          group_id: {
            value: data.group?.id,
            label: data.group?.translation.title,
          },
          tags: data.tags?.map((item) => ({
            label: item.translation?.title || 'no name',
            value: item.id,
          })),
        });
        setBackImage([createImage(data.background_img)]);
        setLogoImage([createImage(data.logo_img)]);
        setLocation({
          lat: Number(data.location?.latitude),
          lng: Number(data.location?.longitude),
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const tags = values.tags;
    const newObject = {};
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        newObject[`tags[${i}]`] = tags[i].value;
      }
    }
    const body = {
      ...values,
      'images[0]': logoImage[0]?.name,
      'images[1]': backImage[0]?.name,
      user_id: values.user.value,
      visibility: 1,
      location: location.lat + ',' + location.lng,
      group_id: values.group_id.value,
      user: undefined,
      ...newObject,
    };
    delete body.tags;
    if (!uuid || is_clone) {
      shopService
        .create(body)
        .then(({ data }) => {
          dispatch(
            replaceMenu({
              id: `shop-${data.uuid}`,
              url: `shop/${data.uuid}`,
              name: t('add.shop'),
              data: data,
              refetch: false,
            })
          );
          next();
        })
        .catch((err) => console.log(err))
        .finally(() => setLoadingBtn(false));
    } else {
      shopService
        .update(uuid, body)
        .then(() => {
          toast.success('Successfully created');
          navigate(`/shop/${uuid}`);
          next();
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingBtn(false));
    }
  };

  useEffect(() => {
    if (activeMenu?.refetch && uuid) {
      fetchShop(uuid);
    }
  }, [activeMenu?.refetch]);

  const onCheck = async () => {
    try {
      const values = await form.validateFields();
      console.log('Success:', values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo.errorFields);
      toast.error(
        errorInfo.errorFields[0].errors[0] +
          ':' +
          errorInfo.errorFields[0].name[0]
      );
    }
  };

  return (
    <Form
      form={form}
      name='basic'
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        visibility: true,
        status: 'new',
        ...activeMenu.data,
      }}
    >
      {loading ? (
        <Loading />
      ) : (
        <ShopAddData
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          backImage={backImage}
          setBackImage={setBackImage}
          form={form}
          location={location}
          setLocation={setLocation}
        />
      )}

      <Space>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('next')}
        </Button>
      </Space>
    </Form>
  );
};
export default CreateShop;
