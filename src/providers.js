import React from 'react';
import { ConfigProvider } from 'antd';
import { shallowEqual, useSelector } from 'react-redux';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import useBodyClass from './helpers/useBodyClass';
import AppLocale from './configs/app-locale';
import i18n from './configs/i18next';

const themes = {
  dark: '/css/dark-theme.css',
  light: '/css/light-theme.css',
};

export default function Providers({ children }) {
  const { theme } = useSelector((state) => state.theme, shallowEqual);
  useBodyClass(`dir-${theme.direction}`);

  return (
    <ThemeSwitcherProvider
      themeMap={themes}
      defaultTheme={theme.currentTheme}
    >
      <ConfigProvider
        locale={AppLocale[i18n.language]}
        direction={theme.direction}
      >
        {children}
      </ConfigProvider>
    </ThemeSwitcherProvider>
  );
}
