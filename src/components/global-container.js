import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { addMenu } from '../redux/slices/menu';
import { PlusCircleOutlined } from '@ant-design/icons';
import FilterColumns from './filter-column';

const GlobalContainer = ({
  children,
  containerName,
  headerTitle,
  navLInkTo,
  buttonTitle,
  setColumns,
  columns = [],
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addMenuItem = () => {
    let url = '';
    const linkArr = navLInkTo.split('');
    if (linkArr[0] === '/') {
      linkArr.shift();
    }
    url = linkArr.join('');
    const data = { id: url, url, name: buttonTitle };
    dispatch(addMenu(data));
    navigate(navLInkTo);
  };

  return (
    <div className={containerName}>
      <Card
        title={headerTitle}
        extra={
          <Space>
            {buttonTitle ? (
              <>
                <Button
                  type='primary'
                  style={{ marginRight: '15px' }}
                  icon={<PlusCircleOutlined />}
                  onClick={addMenuItem}
                >
                  {buttonTitle}
                </Button>
              </>
            ) : null}
            <FilterColumns setColumns={setColumns} columns={columns} />
          </Space>
        }
      >
        {children}
      </Card>
    </div>
  );
};

export default GlobalContainer;
