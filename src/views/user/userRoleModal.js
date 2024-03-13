import React, { useState } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import userService from '../../services/user';
import { shallowEqual, useDispatch } from 'react-redux';
import { fetchUsers } from '../../redux/slices/user';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchClients } from '../../redux/slices/client';
import { useSelector } from 'react-redux';

export default function UserRoleModal({ data, handleCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth, shallowEqual);
  function changeRole(uuid, role) {
    setLoading(true);
    userService
      .updateRole(uuid, { role })
      .then(() => {
        toast.success(t('successfully.updated'));
        if (data.role === 'user') {
          dispatch(fetchClients());
        } else {
          dispatch(fetchUsers({ role: data.role }));
        }
        handleCancel();
      })
      .finally(() => setLoading(false));
  }

  const onFinish = (values) => {
    changeRole(data.uuid, values.role);
  };
  console.log(user);
  return (
    <Modal
      visible={!!data}
      title={t('change.user.role')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        name='user-role'
        form={form}
        onFinish={onFinish}
        initialValues={data}
      >
        <Form.Item
          name='role'
          label={t('role')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Select className='w-100'>
            {user?.role !== 'manager' && (
              <Select.Option value='manager'>{t('manager')}</Select.Option>
            )}
            <Select.Option value='seller'>{t('seller')}</Select.Option>
            {/* <Select.Option value='moderator'>{t('moderator')}</Select.Option> */}
            <Select.Option value='deliveryman'>
              {t('deliveryman')}
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
