import React, { useMemo, useState, useEffect } from 'react';
import { Input } from 'antd';
import { debounce } from 'lodash';
import { SearchOutlined } from '@ant-design/icons';

export default function SearchInput({
  handleChange,
  defaultValue,
  resetSearch,
  ...props
}) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  const debounceSearch = useMemo(() => {
    const loadOptions = (value) => {
      handleChange(value);
    };
    return debounce(loadOptions, 800);
  }, []);

  useEffect(() => {
    setSearchTerm(defaultValue);
  }, [resetSearch]);

  return (
    <Input
      value={searchTerm}
      onChange={(event) => {
        const { value } = event.target;
        setSearchTerm(value.replace(/\s/g, ''));
        debounceSearch(value.replace(/\s/g, ''));
      }}
      prefix={<SearchOutlined />}
      {...props}
    />
  );
}
