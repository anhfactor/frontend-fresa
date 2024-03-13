import moment from 'moment';
import React from 'react';
import checkIsDisabledDay from './checkIsDisabledDay';

const GetWorkingHours = ({ shop }) => {
  const today = moment().format('dddd');
  const times = shop?.shop_working_days?.find((item) =>
    item.day.toUpperCase().includes(today.toUpperCase())
  );

  if (times && !checkIsDisabledDay(0, shop))
    return <div className='range'>{`${times.from}-${times.to} `}</div>;
  else return 'Close';
};

export default GetWorkingHours;
