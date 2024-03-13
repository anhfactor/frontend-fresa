import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDemo from 'helpers/useDemo';

export default function DeleteButton({ onClick, type = 'default', ...props }) {
  const { t } = useTranslation();
  const { isDemo } = useDemo();
  const handleClick = () => {
    console.log(isDemo);
    if (isDemo) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    onClick();
  };

  return (
    <Button
      icon={<DeleteOutlined />}
      onClick={handleClick}
      type={type}
      {...props}
    />
  );
}
