import React, { createContext, useState } from 'react';

export const Context = createContext(undefined);

export const ContextProvider = ({ children }) => {
  const [path, setPath] = useState([]);
  const [user, setUser] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const defaultLanguage = localStorage.getItem('defaultLang');
  const [defaultLang, setDefaultLang] = useState(defaultLanguage || 'en');

  const value = {
    path,
    setPath,
    user,
    setUser,
    fileList,
    setFileList,
    setDefaultLang,
    defaultLang,
    isModalVisible,
    setIsModalVisible,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
