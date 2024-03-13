import React, { useState } from 'react';
import { Button, Dropdown, Menu, Space, Switch, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Text } = Typography;
const FilterColumns = ({ columns = [], setColumns }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menu = (
    <Menu>
      {columns?.map((item, key) => (
        <Menu.Item key={key}>
          <Space className='d-flex justify-content-between'>
            <Text>{item.title}</Text>
            <Switch
              defaultChecked
              onClick={() => {
                onChange(item);
              }}
            />
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );
  const handleVisibleChange = (flag) => {
    setOpen(flag);
  };
  function onChange(checked) {
    const newArray = columns?.map((item) => {
      if (item.dataIndex === checked.dataIndex) {
        item.is_show = !item?.is_show;
      }
      return item;
    });
    setColumns(newArray);
  }
  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      onVisibleChange={handleVisibleChange}
      visible={open}
    >
      <MoreOutlined style={{ fontSize: '26px' }} />
    </Dropdown>
  );
};

export default FilterColumns;
