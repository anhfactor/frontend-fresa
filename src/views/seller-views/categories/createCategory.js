import React, { useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from '../../../components/search';
import { setRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import sellerCategory from '../../../services/seller/category';

export default function CreateCategory({ isModalOpen, handleCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();

  const onFinish = (values) => {
    const body = {
      categories: values.title.map((item) => item.value),
    };
    setLoading(true);
    sellerCategory
      .create(body)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  async function fetchCategories(search) {
    const params = { search, perPage: 10 };
    return sellerCategory.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  return (
    <Modal
      visible={isModalOpen}
      title={t('add.category')}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          key={'saveBtn'}
          onClick={() => form.submit()}
          loading={loading}
        >
          {t('save')}
        </Button>,
        <Button type='default' key={'cancelBtn'} onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        name='user-address'
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          name='title'
          label={t('title')}
          rules={[{ required: true, message: 'required' }]}
        >
          <DebounceSelect
            mode='multiple'
            placeholder='Select category'
            fetchOptions={fetchCategories}
            style={{ minWidth: 150 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
