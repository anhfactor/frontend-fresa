import { Form, Input } from 'antd';
import parsePhoneNumberFromString from 'libphonenumber-js';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const PhoneInput = ({ error, ...props }) => {
  const [help, setHelp] = useState(error);

  const validatePhone = (_, value) => {
    setHelp(null);
    try {
      const phoneNumber = parsePhoneNumberFromString(value);

      if (!value || (phoneNumber && phoneNumber.isValid())) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error('Please enter a valid phone number. exe: +12133734253')
      );
    } catch (error) {
      return Promise.reject(
        new Error('Please enter a valid phone number. exe: +12133734253')
      );
    }
  };

  useEffect(() => {
    setHelp(error);
  }, [error]);

  const phoneHelp = help?.phone?.[0] || null;
  const validateStatus = phoneHelp ? 'error' : 'success';
  return (
    <Form.Item
      {...props}
      help={phoneHelp}
      validateStatus={validateStatus}
      rules={[
        { required: true, message: 'Please enter your phone number.' },
        { validator: validatePhone },
      ]}
    >
      <Input className='w-100' />
    </Form.Item>
  );
};

export default PhoneInput;
