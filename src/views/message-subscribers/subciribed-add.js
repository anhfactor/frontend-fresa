import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tooltip,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import TextEditor from './textEditor';
import moment from 'moment';
import messageSubscriberService from '../../services/messageSubscriber';
import { fetchMessageSubscriber } from '../../redux/slices/messegeSubscriber';
import emailService from '../../services/emailSettings';
import { DebounceSelect } from '../../components/search';

const MessageSubciribedAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [hasDate, setHasDate] = useState(activeMenu.data?.has_date);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const handleChange = (event) => setHasDate(event.target.checked);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const fetchEmailProvider = () => {
    return emailService.get().then(({ data }) =>
      data.map((item) => ({
        label: item.host,
        value: item.id,
      }))
    );
  };

  const onFinish = (values) => {
    const body = {
      ...values,
      email_setting_id: values.email_setting_id.value,
      send_to: moment(values.send_to).format('YYYY-MM-DD HH:mm:ss'),
    };
    setLoadingBtn(true);
    const nextUrl = 'message/subscriber';
    messageSubscriberService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchMessageSubscriber());
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('add.subscriber')} className='h-100'>
      <Form
        name='subscriber-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ type: 'order', ...activeMenu.data }}
        className='d-flex flex-column h-100'
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('subject')}
              name='subject'
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
          <Col span={12}>
            <Form.Item
              label={t('type')}
              name='type'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select>
                <Select.Option value={'order'}>
                  <Tooltip title={t('order.information')}>{t('order')}</Tooltip>
                </Select.Option>
                <Select.Option value={'subscribe'}>
                  <Tooltip title={t('subscribe.information')}>
                    {t('subscribe')}
                  </Tooltip>
                </Select.Option>
                <Select.Option value={'verify'}>
                  <Tooltip title={t('verify.information')}>
                    {t('verify')}
                  </Tooltip>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('email.provider')}
              name='email_setting_id'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                fetchOptions={fetchEmailProvider}
                className='w-100'
                placeholder={t('email.provider')}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <TextEditor languages={languages} form={form} lang={defaultLang} />
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('alt.body')}
              name='alt_body'
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
          <Col span={12}>
            <Form.Item name='has_date' valuePropName='checked'>
              <Checkbox checked={hasDate} onChange={handleChange}>
                {t('choose.discount.date')}
              </Checkbox>
            </Form.Item>
          </Col>

          {hasDate && (
            <>
              <Col span={6}>
                <Form.Item
                  label={t('send.to')}
                  name='send_to'
                  rules={[
                    {
                      required: true,
                      message: t('required'),
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    className='w-100'
                    disabledDate={(current) =>
                      moment().add(-1, 'days') >= current
                    }
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
        <div className='flex-grow-1 d-flex flex-column justify-content-end'>
          <div className='pb-5'>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('send')}
            </Button>
            {/* <Button
              className='ml-3'
              type='primary'
              htmlType='submit'
              loading={loadingBtn}
            >
              {t('save.and.send')}
            </Button> */}
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default MessageSubciribedAdd;
