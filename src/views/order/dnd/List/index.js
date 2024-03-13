import { SyncOutlined } from '@ant-design/icons';
import { Alert, Space, Tag } from 'antd';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

const List = ({
  children,
  title,
  name,
  isDropDisabled,
  loading = false,
  reloadCurrentOrder,
  statistic,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Alert
        message={
          <Space>
            <SyncOutlined
              size={20}
              style={{ cursor: 'pointer' }}
              spin={loading}
              onClick={() => reloadCurrentOrder(name)}
            />
            {t(title)}
            <Tag>
              {statistic?.[name] || <SyncOutlined size={20} spin={loading} />}
            </Tag>
          </Space>
        }
        className={`mb-4 ${name}`}
        style={{
          textAlign: 'center',
          fontSize: 16,
          textTransform: 'capitalize',
        }}
      />
      <Droppable droppableId={name} isDropDisabled={isDropDisabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            className='h-screen'
            style={{ opacity: isDropDisabled ? 0.6 : 1 }}
          >
            <>
              {children}
              {provided.placeholder}
            </>
          </div>
        )}
      </Droppable>
    </>
  );
};

export default List;
