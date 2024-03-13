import { Form, Input } from 'antd';
import useDemo from 'helpers/useDemo';
import { t } from 'i18next';
import React from 'react';

const PasswordConfirmInput = (props) => {
  const { isDemo } = useDemo();
  const { error } = props || {};

  return (
    <Form.Item
      {...props}
      hasFeedback
      help={
        error?.password_confirmation ? error.password_confirmation[0] : null
      }
      validateStatus={error?.password_confirmation ? 'error' : 'success'}
      rules={[
        {
          required: true,
          message: t('required'),
        },
        ({ getFieldValue }) => ({
          validator(rule, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(t('two.passwords.dont.match'));
          },
        }),
      ]}
    >
      <Input.Password type='password' iconRender={props.iconRender} />
    </Form.Item>
  );
};

export default PasswordConfirmInput;
