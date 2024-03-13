import React from 'react';
import { DatePicker, Form } from 'antd';
import moment from 'moment';

const BirthdateValidator = (props) => {
  const validateBirthdate = (_, value) => {
    const currentDate = new Date();
    const minAge = 12;

    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - minAge);

    if (!value || value >= currentDate || value > minDate) {
      return Promise.reject(`Must be over ${minAge} years old`);
    }

    return Promise.resolve();
  };

  return (
    <Form.Item
      {...props}
      rules={[
        { required: true, message: 'Please enter your birthdate.' },
        { validator: validateBirthdate },
      ]}
    >
      <DatePicker
        className='w-100'
        onChange={props.onChange || (() => {})}
        disabledDate={(current) => moment().add(0, 'days') <= current}
      />
    </Form.Item>
  );
};

export default BirthdateValidator;
