import React, { useState } from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchExtraValues } from '../../../redux/slices/extraValue';
import extraService from '../../../services/extra';
import ExtraValueModal from './extra-value-modal';
import ExtraDeleteModal from './extra-delete-modal';
import DeleteButton from '../../../components/delete-button';

export default function ExtraValue() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { extraGroups } = useSelector(
    (state) => state.extraGroup,
    shallowEqual
  );
  const { extraValues, loading } = useSelector(
    (state) => state.extraValue,
    shallowEqual
  );

  const [id, setId] = useState(null);
  const [modal, setModal] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const column = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'extra_group_id',
      key: 'extra_group_id',
      render: (id) =>
        extraGroups.find((item) => item.id === id).translation?.title,
    },
    {
      title: t('value'),
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: t('options'),
      render: (record) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => setModal(record)}
          />
          <DeleteButton
            type='primary'
            danger
            icon={<DeleteOutlined />}
            onClick={() => setId(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleCancel = () => setModal(null);

  const deleteExtra = () => {
    setLoadingBtn(true);
    extraService
      .deleteValue(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setId(null);
        dispatch(fetchExtraValues());
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <div>
      <div className='d-flex justify-content-end'>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setModal({})}
        >
          {t('add.extra')}
        </Button>
      </div>
      <Table
        loading={loading}
        columns={column}
        dataSource={extraValues}
        rowKey={(record) => record.id}
        pagination={false}
      />
      {modal && <ExtraValueModal modal={modal} handleCancel={handleCancel} />}
      {id && (
        <ExtraDeleteModal
          id={id}
          click={deleteExtra}
          text={t('delete.extra')}
          loading={loadingBtn}
          handleClose={() => setId(null)}
        />
      )}
    </div>
  );
}
