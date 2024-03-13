import React, { useState, useContext, useEffect } from 'react';
import { Switch, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { fetchEmailProvider } from '../../redux/slices/emailProvider';
import emailService from '../../services/emailSettings';
import { toast } from 'react-toastify';
import { Context } from '../../context/context';
import { disableRefetch } from '../../redux/slices/menu';
import moment from 'moment';

export default function EmailSettings() {
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [id, setId] = useState(null);
  const [columns, setColumns] = useState([
    {
      title: t('from_site'),
      dataIndex: 'from_site',
      key: 'from_site',
      is_show: true,
    },
    {
      title: t('from.to'),
      dataIndex: 'from_to',
      key: 'from_to',
      render: (from_to) => getMsakedEmail2(from_to),
      is_show: true,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.id);
            }}
            disabled={row.deleted_at}
            checked={active}
          />
        );
      },
      is_show: true,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => moment(created_at).format('YYYY-MM-DD'),
      is_show: true,
    },
  ]);
  const { setIsModalVisible } = useContext(Context);
  const { emailProvider, loading } = useSelector(
    (state) => state.emailProvider,
    shallowEqual
  );

  function getMsakedEmail2(email) {
    let skipFirstChars = 3;
    let firstThreeChar = email.slice(0, skipFirstChars);

    let domainIndexStart = email.lastIndexOf('@');
    let maskedEmail = email.slice(skipFirstChars, domainIndexStart - 1);
    maskedEmail = maskedEmail.replace(/./g, '*');
    let domainPlusPreviousChar = email.slice(
      domainIndexStart - 1,
      email.length
    );

    return firstThreeChar.concat(maskedEmail).concat(domainPlusPreviousChar);
  }

  const setDefaultLang = () => {
    setLoadingBtn(true);
    emailService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        setIsModalVisible(false);
        dispatch(fetchEmailProvider());
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchEmailProvider());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer
      headerTitle={t('email.provider')}
      columns={columns}
      setColumns={setColumns}
    >
      <Table
        scroll={{ x: 1024 }}
        columns={columns.filter((items) => items.is_show)}
        dataSource={emailProvider}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
      />
      <CustomModal
        click={setDefaultLang}
        text={t('change.default.language')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
