import React, { useContext, useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import '../../assets/scss/page/language.scss';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/scss/page/cyrrency.scss';
import GlobalContainer from '../../components/global-container';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import currencyService from '../../services/currency';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { fetchCurrencies } from '../../redux/slices/currency';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';

const Currencies = () => {
  const { t } = useTranslation();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currencies, loading } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const [columns, setColumns] = useState([
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('symbol'),
      is_show: true,
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('rate'),
      is_show: true,
      dataIndex: 'rate',
      key: 'rate',
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

            {row.default ? (
              ''
            ) : (
              <DeleteButton
                icon={<DeleteOutlined />}
                onClick={() => {
                  setId(row.id);
                  setIsModalVisible(true);
                }}
              />
            )}
          </Space>
        );
      },
    },
  ]);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `currency/${row.id}`,
        id: 'currency_edit',
        name: t('edit.currency'),
      })
    );
    navigate(`/currency/${row.id}`);
  };

  const deleteCurrency = () => {
    currencyService.delete(id).then(() => {
      toast.success(t('successfully.deleted'));
      setIsModalVisible(false);
      dispatch(fetchCurrencies());
    });
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchCurrencies());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer
      headerTitle={t('currencies')}
      navLInkTo={'/currency/add'}
      buttonTitle={t('add.currency')}
      columns={columns}
      setColumns={setColumns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={currencies}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
      />
      <CustomModal click={deleteCurrency} text={t('delete.currency')} />
    </GlobalContainer>
  );
};

export default Currencies;
