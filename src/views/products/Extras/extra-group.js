import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import extraService from '../../../services/extra';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchExtraGroups } from '../../../redux/slices/extraGroup';
import { disableRefetch } from '../../../redux/slices/menu';
import ExtraGroupModal from './extra-group-modal';
import { fetchExtraValues } from '../../../redux/slices/extraValue';
import ExtraDeleteModal from './extra-delete-modal';
import DeleteButton from '../../../components/delete-button';

export default function ExtraGroup() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { extraGroups, loading } = useSelector(
    (state) => state.extraGroup,
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
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
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

  const onDeleteExtra = () => {
    setLoadingBtn(true);
    extraService
      .deleteGroup(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setId(null);
        dispatch(fetchExtraGroups());
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchExtraGroups());
      dispatch(fetchExtraValues());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <div>
      <div className='d-flex justify-content-end'>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setModal({})}
        >
          {t('add.extra.group')}
        </Button>
      </div>
      <Table
        loading={loading}
        columns={column}
        dataSource={extraGroups}
        rowKey={(record) => record.id}
        pagination={false}
      />
      {modal && <ExtraGroupModal modal={modal} handleCancel={handleCancel} />}
      {id && (
        <ExtraDeleteModal
          id={id}
          click={onDeleteExtra}
          text={t('delete.extra.group')}
          loading={loadingBtn}
          handleClose={() => setId(null)}
        />
      )}
    </div>
  );
}
