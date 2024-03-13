import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/page/language.scss';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Image, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Context } from '../../context/context';
import { toast } from 'react-toastify';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import languagesService from '../../services/languages';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import getImage from '../../helpers/getImage';
import { fetchLang } from '../../redux/slices/languages';
import useDemo from 'helpers/useDemo';

const Languages = () => {
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [type, setType] = useState('');
  const { setIsModalVisible } = useContext(Context);
  const { isDemo, demoFunc } = useDemo();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allLanguages, loading } = useSelector(
    (state) => state.languages,
    shallowEqual
  );

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `language/${row.id}`,
        id: 'language_edit',
        name: t('edit.language'),
      })
    );
    navigate(`/language/${row.id}`);
  };
  const [columns, setColumns] = useState([
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('image'),
      is_show: true,
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => {
        return (
          <Image
            src={getImage(img)}
            alt='img_gallery'
            width={100}
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'active',
      key: 'active',
      render: (active) =>
        active ? (
          <Tag color='cyan'> {t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
        ),
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />

            {row.default === 1 ? (
              ''
            ) : (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => {
                  setId(row.id);
                  setType('deleteLang');
                  setIsModalVisible(true);
                }}
              />
            )}
          </Space>
        );
      },
    },
  ]);

  const setDefaultLang = () => {
    setLoadingBtn(true);
    languagesService
      .setDefault(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        setIsModalVisible(false);
        dispatch(fetchLang());
      })
      .finally(() => setLoadingBtn(false));
  };

  const deleteLang = () => {
    setLoadingBtn(true);
    languagesService
      .delete(id)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchLang());
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchLang());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer
      headerTitle={t('languages')}
      navLInkTo={'/language/add'}
      buttonTitle={t('add.language')}
      columns={columns}
      setColumns={setColumns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={allLanguages}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
        rowSelection={{
          selectedRowKeys: [allLanguages.find((item) => item.default)?.id],
          type: 'radio',
          onChange: (values) => {
            if (isDemo) {
              demoFunc();
              return;
            }
            setIsModalVisible(true);
            setId(values[0]);
            setType(true);
          },
        }}
      />
      <CustomModal
        click={type === 'deleteLang' ? deleteLang : setDefaultLang}
        text={
          type !== 'deleteLang'
            ? t('change.default.language')
            : t('delete.language')
        }
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
};

export default Languages;
