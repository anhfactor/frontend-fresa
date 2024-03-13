import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from '../../../components/search';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/seller/product';
import { addMenu } from '../../../redux/slices/menu';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

export default function SelectProduct({
  isModalOpen,
  handleCancel,
  isGiftCard,
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const goToShow = (row) => {
    if (isGiftCard) {
      dispatch(
        addMenu({
          url: `/seller/gift-card/add/${row}`,
          id: 'seller-gift-card-add',
          name: t('seller.gift.card.add'),
        })
      );
      navigate(`/seller/gift-card/add/${row}`);
    } else {
      dispatch(
        addMenu({
          url: `/seller/product/add/${row}`,
          id: 'seller-product-add',
          name: t('seller.product.add'),
        })
      );
      navigate(`/seller/product/add/${row}`);
    }
  };

  const onFinish = (values) => {
    if (values.title) {
      goToShow(values.title.value);
    } else if (values.qr_code) {
      goToShow(values.qr_code.value);
    } else {
      return toast.error(t('please.select.one.option'));
    }
    handleCancel();
  };

  async function fetchCategoriesTitle(search) {
    setLoading(true);
    const params = { search, perPage: 10, gift: isGiftCard ? 1 : undefined };
    return productService
      .search(params)
      .then(({ data }) =>
        data.map((item) => ({
          label: item.translation?.title,
          value: item?.uuid,
        }))
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  async function fetchCategoriesQrCode(qr_code) {
    const params = { qr_code, perPage: 10, gift: isGiftCard ? 1 : undefined };
    return productService
      .search(params)
      .then(({ data }) =>
        data.map((item) => ({
          label: item.qr_code,
          value: item?.uuid,
        }))
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  const gotoNewProductPage = () => {
    const nextUrl = 'seller/product/add';
    dispatch(
      addMenu({
        url: `/${nextUrl}`,
        id: 'seller-new-product-add',
        name: t('add.new.product'),
      })
    );
    navigate(`/${nextUrl}`);
  };

  const gotoNewGiftCardPage = () => {
    const nextUrl = '/seller/gift-card/add';
    dispatch(
      addMenu({
        url: nextUrl,
        id: 'seller-new-gift-card-add',
        name: t('add.new.gift.card'),
      })
    );
    navigate(nextUrl);
  };

  // useEffect(() => {
  //     window.addEventListener('scroll', handleScroll);
  //     return () => {
  //         window.removeEventListener('scroll', handleScroll);
  //     };
  // });

  // const handleScroll = () => {
  //     const lastProductLoaded = document.querySelector(
  //         '.products_row > .products_item:last-child'
  //     );
  //     if (lastProductLoaded) {
  //         const lastProductLoadedOffset =
  //             lastProductLoaded.offsetTop + lastProductLoaded.clientHeight;
  //         const pageOffset = window.pageYOffset + window.innerHeight;
  //         if (pageOffset > lastProductLoadedOffset) {
  //             if (lastPage > page) {
  //                 if (!loading) {
  //                     setPage(page + 1);
  //                 }
  //             }
  //         }
  //     }
  // };

  return (
    <Modal
      visible={isModalOpen}
      title={isGiftCard ? t('add.gift.card') : t('add.product')}
      onCancel={handleCancel}
      footer={[
        isGiftCard ? (
          <Button
            type='primary'
            key={'newSaveBtn'}
            onClick={() => gotoNewGiftCardPage()}
          >
            {t('add.new.gift.card')}
          </Button>
        ) : (
          <Button
            type='primary'
            key={'newSaveBtn'}
            onClick={() => gotoNewProductPage()}
          >
            {t('add.new.product')}
          </Button>
        ),
        <Button type='primary' key={'saveBtn'} onClick={() => form.submit()}>
          {t('create')}
        </Button>,
        <Button type='default' key={'cancelBtn'} onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        name='add-product'
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          name='title'
          label={
            isGiftCard ? t('search.gift.card.title') : t('search.product.title')
          }
        >
          <DebounceSelect
            fetchOptions={fetchCategoriesTitle}
            style={{ minWidth: 150 }}
            loading={loading}
          />
        </Form.Item>
        <Form.Item
          name='qr_code'
          label={
            isGiftCard
              ? t('search.gift.card.qr_code')
              : t('search.product.qr_code')
          }
        >
          <DebounceSelect
            fetchOptions={fetchCategoriesQrCode}
            style={{ minWidth: 150 }}
            loading={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
