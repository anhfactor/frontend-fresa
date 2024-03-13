import React from 'react';
import { Card } from 'antd';

export default function StatisticNumberWidget({
  title = 'Orders',
  value = 0,
  loading = false,
}) {
  return (
    <Card className='statistics-card' loading={loading}>
      <div className='card-wrapper'>
        <div className='space' />
        <h1 className='mb-0 font-weight-bold number'>{value}</h1>
        <span
          className={`highlighter ${
            value < 10 ? 'red' : value < 100 ? 'grey' : 'green'
          }`}
        />
        {title && <h4 className='title'>{title}</h4>}
      </div>
    </Card>
  );
}
