import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';

const EmailInput = ({ error, ...props }) => {
  const [help, setHelp] = useState(error);

  const validateEmail = (_, value) => {
    setHelp(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('Please enter a valid email address.');
  };

  useEffect(() => {
    setHelp(error);
  }, [error]);

  const emailHelp = help?.email?.[0] || null;
  const validateStatus = emailHelp ? 'error' : 'success';

  return (
    <Form.Item
      {...props}
      help={emailHelp}
      validateStatus={validateStatus}
      rules={[
        { required: true, message: 'Please enter your email address.' },
        { validator: validateEmail },
      ]}
    >
      <Input type='email' />
    </Form.Item>
  );
};

export default EmailInput;
