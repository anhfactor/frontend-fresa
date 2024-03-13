import React from 'react';
import { Button, Card } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { export_url } from '../../configs/app-global';

export default function BlogImport() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
    categoryService.import(formData).then((data) => {
      toast.success(t('successfully.import'));
      dispatch(setMenuData({ activeMenu, data: createFile(file) }));
      onSuccess('ok');
      dispatch(fetchCategories());
    });
  };

  const downloadFile = () => {
    const body = export_url + 'import-example/category_import.xlsx';
    window.location.href = body;
  };

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
      <Button type='primary' className='mb-4' onClick={downloadFile}>
        {t('download.csv')}
      </Button>
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
