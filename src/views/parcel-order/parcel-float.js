import React from 'react';
import { Switch } from 'antd';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setParcelMode } from 'redux/slices/theme';
import { shallowEqual, useSelector } from 'react-redux';
import { clearMenu } from 'redux/slices/menu';
import { useNavigate } from 'react-router-dom';

export default function ParcelFloat() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme, shallowEqual);

  return (
    <div className='parcel-float'>
      <div
        className='d-flex align-items-center justify-content-between'
        style={{ columnGap: 12 }}
      >
        <label>{t('parcel.mode')}:</label>
        <Switch
          checked={theme.parcelMode}
          onChange={(event) => {
            dispatch(setParcelMode(event));
            dispatch(clearMenu());
            navigate('/');
          }}
        />
      </div>
    </div>
  );
}
