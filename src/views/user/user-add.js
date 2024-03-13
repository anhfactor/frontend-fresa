import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromMenu } from '../../redux/slices/menu';
import userService from '../../services/user';
import { fetchClients } from '../../redux/slices/client';
import ImageUploadSingle from '../../components/image-upload-single';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import EmailInput from 'components/form/email-input';
import PhoneInput from 'components/form/phone-input';
import PasswordInput from 'components/form/password-input';
import PasswordConfirmInput from 'components/form/password-confirm-input';
import BirthdateValidator from 'components/form/birthdate-input';

export default function UserAdd() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [date, setDate] = useState();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const navigate = useNavigate();

  const changeData = (data, dataText) => setDate(dataText);

  const activeMenu = useSelector((list) => list.menu.activeMenu);
  const dispatch = useDispatch();
  const [image, setImage] = useState(activeMenu?.data?.image || null);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.user_email,
      phone: values.phone,
      birthday: date,
      gender: values.gender,
      password_confirmation: values.password_confirmation,
      password: values.password,
      images: [image?.name],
    };
    const nextUrl = 'users/user';
    userService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchClients());
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('add.user')}>
      <Form
        form={form}
        layout='vertical'
        initialValues={{ gender: 'male' }}
        onFinish={onFinish}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item label={t('avatar')}>
              <ImageUploadSingle
                type='users'
                image={image}
                setImage={setImage}
                form={form}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('firstname')}
              name='firstname'
              help={error?.firstname ? error.firstname[0] : null}
              validateStatus={error?.firstname ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={'lastname'}
              name='lastname'
              help={error?.lastname ? error.lastname[0] : null}
              validateStatus={error?.lastname ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <PhoneInput label={t('phone')} name='phone' error={error} />
          </Col>

          <Col span={12}>
            <BirthdateValidator
              label={t('birthday')}
              name='birthday'
              valuePropName='data'
              onChange={changeData}
            />
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('gender')}
              name='gender'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select picker='dayTime' className='w-100'>
                <Select.Option value='male'>{t('male')}</Select.Option>
                <Select.Option value='female'>{t('female')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <EmailInput label={t('email')} name='user_email' error={error} />
          </Col>

          <Col span={12}>
            <PasswordInput
              label={t('password')}
              name='password'
              error={error}
            />
          </Col>
          <Col span={12}>
            <PasswordConfirmInput
              label={t('password.confirmation')}
              name='password_confirmation'
              dependencies={['password']}
              error={error}
            />
          </Col>

          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
        </Row>
      </Form>
    </Card>
  );
}
