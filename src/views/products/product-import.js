import React from 'react';
import { Button, Card, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import productService from '../../services/product';
import { setMenuData } from '../../redux/slices/menu';
import { fetchProducts } from '../../redux/slices/product';
import { export_url } from '../../configs/app-global';
import shopService from 'services/shop';
import { DebounceSelect } from 'components/search';
import { useState } from 'react';

export default function ProductImport() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedShop, setSelectedShop] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const createFile = (file) => {
    return {
      uid: file.name,
      name: file.name,
      status: 'done',
      url: file.name,
      created: true,
    };
  };

  const beforeUpload = (file) => {
    const isXls =
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';
    if (!isXls) {
      toast.error(`${file.name} is not valid file`);
      return false;
    }
  };

  const handleUpload = ({ file, onSuccess }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (selectedShop) formData.append('shop_id', selectedShop);
    productService.import(formData).then((data) => {
      toast.success(t('successfully.import'));
      dispatch(setMenuData({ activeMenu, data: createFile(file) }));
      onSuccess('ok');
      dispatch(fetchProducts());
    });
  };

  const downloadFile = () => {
    const body = export_url + 'import-example/product_import.xlsx';
    window.location.href = body;
  };
  const downloadSingleShopFile = () => {
    const body = export_url + 'import-example/shop_product_import.xlsx';
    window.location.href = body;
  };

  async function fetchShops(search) {
    const params = { search };
    return shopService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  return (
    <Card title={t('import')}>
      <div className='alert' role='alert'>
        <div className='alert-header'>
          <InfoCircleOutlined className='alert-icon' />
          <p>Info</p>
        </div>
        1. Download the skeleton file and fill it with proper data.
        <br />
        2. You can download the example file to understand how the data must be
        filled.
        <br />
        3. Once you have downloaded and filled the skeleton file, upload it in
        the form below and submit.
        <br />
        4. After uploading products you need to edit them and set product's
        images and choices.
        <br />
      </div>
      <Space className='mb-4'>
        <Button type='primary' onClick={downloadFile}>
          {t('all.shop.example')}
        </Button>
        <Button type='primary' onClick={downloadSingleShopFile}>
          {t('single.shop.example')}
        </Button>
        <DebounceSelect
          placeholder={t('select.shop')}
          fetchOptions={fetchShops}
          style={{ minWidth: 150 }}
          onChange={(shop) => setSelectedShop(shop?.value || null)}
          value={activeMenu.data?.shop}
        />
      </Space>
      <Dragger
        name='file'
        multiple={false}
        maxCount={1}
        customRequest={handleUpload}
        defaultFileList={activeMenu?.data ? [activeMenu?.data] : null}
        beforeUpload={beforeUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Using this file, it is possible to create a database of new products.
          You need to click the button above to update
        </p>
      </Dragger>
    </Card>
  );
}
