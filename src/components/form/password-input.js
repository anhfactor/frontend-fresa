import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import useDemo from 'helpers/useDemo';

const PasswordInput = ({ error, ...props }) => {
  const { isDemo } = useDemo();
  const [help, setHelp] = useState(error);

  const validatePassword = (_, value) => {
    setHelp(null);
    // Password criteria
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!value || regex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(
      'Password must contain at least 8 characters including one uppercase letter, one lowercase letter, one digit, and one special character.'
    );
  };

  useEffect(() => {
    setHelp(error);
  }, [error]);

  const passwordHelp = help?.password?.[0] || null;
  const validateStatus = passwordHelp ? 'error' : 'success';
  return (
    <Form.Item
      {...props}
      help={passwordHelp}
      validateStatus={validateStatus}
      rules={[
        { required: true, message: 'Please enter a password.' },
        { validator: validatePassword },
      ]}
    >
      <Input.Password className='w-100' />
    </Form.Item>
  );
};

export default PasswordInput;
