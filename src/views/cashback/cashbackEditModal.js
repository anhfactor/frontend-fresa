import React, { useEffect, useState } from 'react';
import { Button, Col, Form, InputNumber, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import pointService from '../../services/points';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setRefetch } from '../../redux/slices/menu';
import Loading from '../../components/loading';

export default function CashbackEditModal({ visibility: id, handleCancel }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const handleOk = () => {
    console.log('ok');
  };

  useEffect(() => {
    setLoading(true);
    pointService
      .getById(id)
      .then(({ data }) => form.setFieldsValue(data))
      .finally(() => setLoading(false));
  }, [id]);

  const onFinish = (values) => {
    console.log('values => ', values);
    setLoadingBtn(true);
    const payload = {
      ...values,
      type: 'percent',
    };
    pointService
      .update(id, payload)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      visible={!!id}
      title={t('edit.cashback')}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button
          key='save-cashback'
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
        >
          {t('save')}
        </Button>,
        <Button key='cancel-cashback' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      {!loading ? (
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                label={t('cashback')}
                name='price'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <InputNumber min={0} className='w-100' addonAfter='%' />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={t('min.amount')}
                name='value'
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
          </Row>
        </Form>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
