import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useThemeSwitcher } from 'react-css-theme-switcher';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';
import { themeChange } from '../redux/slices/theme';

export default function ThemeConfigurator() {
  const { theme } = useSelector((state) => state.theme, shallowEqual);
  const dispatch = useDispatch();
  const { switcher, themes } = useThemeSwitcher();

  const toggleTheme = () => {
    const changedTheme = theme.currentTheme === 'light' ? 'dark' : 'light';
    dispatch(themeChange(changedTheme));
    switcher({ theme: themes[changedTheme] });
  };

  return (
    <span className='icon-button mx-2' onClick={toggleTheme}>
      {theme.currentTheme === 'dark' ? (
        <BsSunFill style={{ fontSize: 20 }} />
      ) : (
        <BsMoonFill style={{ fontSize: 20 }} />
      )}
    </span>
  );
}
