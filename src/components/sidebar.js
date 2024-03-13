import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/scss/components/sidebar.scss';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Divider, Menu, Modal, Space, Layout, Input } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, clearMenu, setMenu } from '../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LangModal from './lang-modal';
import getSystemIcons from '../helpers/getSystemIcons';
import { clearUser } from '../redux/slices/auth';
import NotificationBar from './notificationBar';
import UserModal from './user-modal';
import getAvatar from '../helpers/getAvatar';
import { navCollapseTrigger } from '../redux/slices/theme';
import ThemeConfigurator from './theme-configurator';
import i18n from '../configs/i18next';
import { IMG_URL } from '../configs/app-global';
import { RiArrowDownSFill } from 'react-icons/ri';
import { removeCurrentChat } from '../redux/slices/chat';
import Scrollbars from 'react-custom-scrollbars';
import SubMenu from 'antd/lib/menu/SubMenu';
import { debounce } from 'lodash';
import useDidUpdate from 'helpers/useDidUpdate';
import { data as allRoutes } from 'configs/menu-config-test';

const { Sider } = Layout;

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { theme } = useSelector((state) => state.theme, shallowEqual);
  const { delivery } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );
  const { navCollapsed, direction } = useSelector(
    (state) => state.theme.theme,
    shallowEqual
  );
  const parcelMode = useMemo(
    () => !!theme.parcelMode && user?.role === 'admin',
    [theme, user]
  );

  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const routes = useMemo(() => filterUserRoutes(user.urls), [user]);
  const active = routes?.find((item) => pathname.includes(item.url));
  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  const [data, setData] = useState(parcelMode ? allRoutes.parcel : routes);
  const [searchTerm, setSearchTerm] = useState(null);
  console.log(allRoutes);
  useDidUpdate(() => {
    if (parcelMode) {
      setData(allRoutes.parcel);
    } else {
      setData(routes);
    }
  }, [theme]);

  const handleOk = () => {
    batch(() => {
      dispatch(clearUser());
      dispatch(clearMenu());
      dispatch(removeCurrentChat());
    });
    setIsModalVisible(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addNewItem = (item) => {
    if (item.name === 'logout') {
      showModal();
      return;
    }
    const data = {
      ...item,
      icon: undefined,
      children: undefined,
      refetch: true,
    };
    dispatch(setMenu(data));
    navigate(`/${item.url}`);
  };

  function filterUserRoutes(routes) {
    let list = routes;
    if (delivery === '1' && user?.role !== 'seller') {
      list = routes?.filter((item) => item?.name !== 'delivery');
    }
    if (delivery === '0' && user?.role !== 'admin') {
      list = routes.filter((item) => item.name !== 'delivery');
    }
    return list;
  }

  const menuTrigger = (event) => {
    event.stopPropagation();
    dispatch(navCollapseTrigger());
  };
  const addMenuItem = (payload) => {
    const data = { ...payload, icon: undefined };
    dispatch(addMenu(data));
  };
  function getOptionList(routes) {
    const optionTree = [];
    routes?.map((item) => {
      optionTree.push(item);
      item?.submenu?.map((sub) => {
        optionTree.push(sub);
        sub?.children?.map((child) => {
          optionTree.push(child);
        });
      });
    });
    return optionTree;
  }

  const optionList = getOptionList(data);

  const handleChange = (e) => {
    const result = optionList.filter((input) =>
      (input?.name.toUpperCase() ?? '').includes(e.toUpperCase())
    );
    setData(e.length === 0 ? routes : result);
  };

  const debounceSearch = useMemo(() => {
    const loadOptions = (value) => {
      handleChange(value);
    };
    return debounce(loadOptions, 300);
  }, []);

  console.log(data);
  return (
    <>
      <Sider
        dir={direction}
        className='navbar-nav side-nav'
        width={250}
        collapsed={navCollapsed}
        style={{ height: '100vh', top: 0, direction }}
      >
        <div
          className='sidebar-brand cursor-pointer'
          onClick={() => setUserModal(true)}
        >
          <img
            className='sidebar-logo'
            src={getAvatar(user.img)}
            alt={user.fullName}
          />
          <div className='sidebar-brand-text'>
            <h5 className='user-name fw-bold'>{user.fullName}</h5>
            <h6 className='user-status'>{user.role}</h6>
          </div>
          <div className='menu-collapse' onClick={menuTrigger}>
            <MenuFoldOutlined />
          </div>
        </div>

        {!navCollapsed ? (
          <Space className='mx-4 mt-2 d-flex justify-content-between'>
            <span className='icon-button' onClick={() => setLangModal(true)}>
              <img
                className='globalOutlined'
                src={
                  IMG_URL +
                  languages.find((item) => item.locale === i18n.language)?.img
                }
                alt={user.fullName}
              />
              <span className='default-lang'>{i18n.language}</span>
              <RiArrowDownSFill size={15} />
            </span>
            <span className='d-flex'>
              <ThemeConfigurator />
              <NotificationBar />
            </span>
          </Space>
        ) : (
          <div className='menu-unfold' onClick={menuTrigger}>
            <MenuUnfoldOutlined />
          </div>
        )}
        <Divider style={{ margin: '10px 0' }} />
        <span className='mt-2 mb-2 d-flex justify-content-center'>
          <Input
            placeholder='search'
            style={{ width: '90%' }}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              debounceSearch(event.target.value);
            }}
            prefix={<SearchOutlined />}
          />
        </span>
        {/* <Scrollbars
          autoHeight
          autoHeightMin={'84vh'}
          autoHeightMax={'84vh'}
          autoHide
        >
          <Menu
            theme='light'
            mode='inline'
            defaultSelectedKeys={[String(active?.id)]}
          >
            {routes?.map((item) =>
              item.submenu?.length > 0 ? (
                <Menu.ItemGroup key={item.id} title={t(item.name)}>
                  {item.submenu.map((submenu) =>
                    submenu.children?.length > 0 ? (
                      <SubMenu
                        key={submenu.id}
                        title={t(submenu.name)}
                        icon={getSystemIcons(submenu.icon)}
                        onTitleClick={() => addNewItem(submenu)}
                      >
                        {submenu.children?.map((sub, idx) => (
                          <Menu.Item
                            key={'child' + idx + sub.id}
                            icon={getSystemIcons(sub.icon)}
                          >
                            <Link
                              to={'/' + sub.url}
                              onClick={() => addMenuItem(sub)}
                            >
                              <span>{t(sub.name)}</span>
                            </Link>
                          </Menu.Item>
                        ))}
                      </SubMenu>
                    ) : (
                      <Menu.Item
                        key={submenu.id}
                        icon={getSystemIcons(submenu.icon)}
                      >
                        <Link
                          to={'/' + submenu.url}
                          onClick={() => addNewItem(submenu)}
                        >
                          <span>{t(submenu.name)}</span>
                        </Link>
                      </Menu.Item>
                    )
                  )}
                </Menu.ItemGroup>
              ) : (
                <Menu.Item key={item.id} icon={getSystemIcons(item.icon)}>
                  <Link to={'/' + item.url} onClick={() => addNewItem(item)}>
                    <span>{t(item.name)}</span>
                  </Link>
                </Menu.Item>
              )
            )}
          </Menu>
        </Scrollbars> */}
        <Scrollbars
          autoHeight
          autoHeightMin={window.innerHeight > 969 ? '80vh' : '77vh'}
          autoHeightMax={window.innerHeight > 969 ? '80vh' : '77vh'}
          autoHide
        >
          <Menu
            theme='light'
            mode='inline'
            defaultSelectedKeys={[String(active?.id)]}
            defaultOpenKeys={data?.map((i, idx) => i.id + '_' + idx)}
          >
            {data?.map((item, idx) =>
              item.submenu?.length > 0 ? (
                <SubMenu
                  key={item.id + '_' + idx}
                  title={t(item.name)}
                  icon={getSystemIcons(item.icon)}
                >
                  {item.submenu.map((submenu, idy) =>
                    submenu.children?.length > 0 ? (
                      <SubMenu
                        defaultOpen={true}
                        key={submenu.id + '_' + idy}
                        title={t(submenu.name)}
                        icon={getSystemIcons(submenu.icon)}
                        onTitleClick={() => addNewItem(submenu)}
                      >
                        {submenu.children?.map((sub, idk) => (
                          <Menu.Item
                            key={'child' + idk + sub.id}
                            icon={getSystemIcons(sub.icon)}
                          >
                            <Link
                              to={'/' + sub.url}
                              onClick={() => addMenuItem(sub)}
                            >
                              <span>{t(sub.name)}</span>
                            </Link>
                          </Menu.Item>
                        ))}
                      </SubMenu>
                    ) : (
                      <Menu.Item
                        key={submenu.id}
                        icon={getSystemIcons(submenu.icon)}
                      >
                        <Link
                          to={'/' + submenu.url}
                          onClick={() => addNewItem(submenu)}
                        >
                          <span>{t(submenu.name)}</span>
                        </Link>
                      </Menu.Item>
                    )
                  )}
                </SubMenu>
              ) : (
                <Menu.Item key={item.id} icon={getSystemIcons(item.icon)}>
                  <Link to={'/' + item.url} onClick={() => addNewItem(item)}>
                    <span>{t(item.name)}</span>
                  </Link>
                </Menu.Item>
              )
            )}
          </Menu>
          {/* <div style={{ paddingTop: 50 }} /> */}
        </Scrollbars>
      </Sider>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
      >
        <LogoutOutlined
          style={{ fontSize: '25px', color: '#08c' }}
          theme='primary'
        />
        <span className='ml-2'>{t('leave.site')}</span>
      </Modal>

      {langModal && (
        <LangModal
          visible={langModal}
          handleCancel={() => setLangModal(false)}
        />
      )}
      {userModal && (
        <UserModal
          visible={userModal}
          handleCancel={() => setUserModal(false)}
        />
      )}
    </>
  );
};
export default Sidebar;
