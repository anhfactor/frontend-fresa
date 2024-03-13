import React, { useEffect, useState } from 'react';
import { CommentOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import moment from 'moment';
import ticketService from '../../services/ticket';
import GlobalContainer from '../../components/global-container';
import TicketAnswer from './ticketAnswer';
import TicketModal from './ticketModal';
import { useTranslation } from 'react-i18next';

export default function Tickets() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(null);
  const [column, setColumn] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [id, setId] = useState(null);
  const [columns, setColumns] = useState([
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      sorter: (a, b, sortOrder) => sortTable(sortOrder, 'id'),
    },
    {
      title: t('name'),
      is_show: true,
      dataIndex: 'subject',
    },
    {
      title: t('type'),
      is_show: true,
      dataIndex: 'type',
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'rejected' ? 'red' : status === 'open' ? 'blue' : 'cyan'
          }
        >
          {t(status)}
        </Tag>
      ),
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      render: (date) => moment(date).format('DD-MM-YYYY'),
    },
    {
      title: t('options'),
      is_show: true,
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => {
        if (row.parent_id !== 0) {
          return '';
        } else {
          return (
            <Space>
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={() => setId(row.id)}
              />
              <Button
                icon={<CommentOutlined />}
                onClick={() => setTicketId(row.id)}
              />
            </Space>
          );
        }
      },
    },
  ]);
  function sortTable(type, column) {
    console.log('type => ', type);
    let sortType;
    switch (type) {
      case 'ascend':
        sortType = 'asc';
        break;
      case 'descend':
        sortType = 'desc';
        break;

      default:
        break;
    }
    setSort(sortType);
    setColumn(column);
  }

  function fetchTickets() {
    setLoading(true);
    const params = {
      perPage: pageSize,
      page,
      sort,
      column,
    };
    ticketService
      .getAll(params)
      .then((res) => {
        console.log('res => ', res);
        setList(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTickets();
  }, [page, pageSize, sort, column]);

  const onChangePagination = (pageNumber) => {
    setPageSize(pageNumber.pageSize);
    setPage(pageNumber.current);
  };

  return (
    <GlobalContainer
      headerTitle={t('tickets')}
      navLInkTo={'/ticket/add'}
      buttonTitle={t('add.ticket')}
      setColumns={setColumns}
      columns={columns}
    >
      <Table
        columns={columns?.filter((items) => items.is_show)}
        dataSource={list}
        pagination={{
          pageSize,
          page,
          total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      {ticketId && (
        <TicketAnswer
          ticketId={ticketId}
          setTicketId={setTicketId}
          fetchTickets={fetchTickets}
        />
      )}
      {id && (
        <TicketModal
          ticketId={id}
          setTicketId={setId}
          fetchTickets={fetchTickets}
        />
      )}
    </GlobalContainer>
  );
}
