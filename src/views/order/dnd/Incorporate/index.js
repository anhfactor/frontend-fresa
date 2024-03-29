import List from '../List/index';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { Spin } from 'antd';
import OrderCard from '../../../../components/order-card';
import Scrollbars from 'react-custom-scrollbars';
import orderService from '../../../../services/order';
import {
  clearCurrentOrder,
  clearItems,
  setItems,
  updateStatistic,
} from '../../../../redux/slices/orders';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { mockOrderList } from '../../../../constants';
import OrderCardLoader from '../../../../components/order-card-loader';
import { toast } from 'react-toastify';
import { batch } from 'react-redux';
const statuses = [
  'new',
  'accepted',
  'ready',
  'on_a_way',
  'delivered',
  'canceled',
];
const Incorporate = ({
  goToEdit,
  goToShow,
  getInvoiceFile,
  fetchOrderAllItem,
  fetchOrders,
  type,
  statistic,
}) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.orders, shallowEqual);
  const orders = useSelector((state) => state.orders, shallowEqual);
  const [key, setKey] = useState('');
  const [current, setCurrent] = useState({});
  const [currentCId, setCurrentCId] = useState({});

  const removeFromList = (list, index) => {
    const result = Array.from(list);
    const [removed] = result.splice(index, 1);
    return [removed, result];
  };

  const addToList = (list, index, element) => {
    const result = Array.from(list);
    result.splice(index, 0, element);
    return result;
  };

  const changeStatus = (id, params) => {
    orderService
      .updateStatus(id, params)
      .then((res) => {
        toast.success(`#${id} order status changed`);
      })
      .catch((error) => {
        toast.error(`#${id} order status has not changed`);
      });
  };

  const onDragStart = (task) => {
    const id = statuses.findIndex((item) => item === task.source.droppableId);
    setCurrent(task);
    setCurrentCId(id);
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    if (
      result.destination &&
      current.source.droppableId !== result.destination.droppableId
    ) {
      const prevStatus = result.source.droppableId;
      const currentStatus = result.destination.droppableId;
      changeStatus(result.draggableId, {
        status: result.destination.droppableId,
      });
      batch(() => {
        dispatch(
          updateStatistic({
            status: prevStatus,
            qty: statistic[prevStatus] - 1,
          })
        );
        dispatch(
          updateStatistic({
            status: currentStatus,
            qty: statistic[currentStatus] + 1,
          })
        );
      });
    }
    const listCopy = { ...items };
    const sourceList = listCopy[result.source.droppableId];
    const [removedElement, newSourceList] = removeFromList(
      sourceList,
      result.source.index
    );
    listCopy[result.source.droppableId] = newSourceList;
    const destinationList = listCopy[result.destination.droppableId];
    listCopy[result.destination.droppableId] = addToList(
      destinationList,
      result.destination.index,
      removedElement
    );
    dispatch(setItems(listCopy));
    setCurrentCId(null);
  };

  const handleScroll = (event, key) => {
    const lastProductLoaded = event.target.lastChild;
    const pageOffset = event.target.clientHeight + event.target.scrollTop;
    if (lastProductLoaded) {
      const lastProductLoadedOffset =
        lastProductLoaded.offsetTop + lastProductLoaded.clientHeight + 19.9;
      if (pageOffset > lastProductLoadedOffset) {
        if (
          orders[key].meta.last_page > orders[key].meta.current_page &&
          !orders[key].loading
        ) {
          setKey(key);
          fetchOrders({
            page: orders[key].meta.current_page + 1,
            perPage: 5,
            status: key,
          });
        }
      }
    }
  };

  const checkDisable = (index) => {
    if (index === 0 && currentCId === statuses.length - 1) return false;
    if (Boolean(currentCId > index)) return true;
    else return false;
  };

  useEffect(() => {
    dispatch(clearItems());
    fetchOrderAllItem();
  }, [type]);

  const reloadCurrentOrder = (status) => {
    dispatch(clearCurrentOrder(status));
    fetchOrders({ status });
  };
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className='order-board'>
        {statuses?.map((item, index) => (
          <div key={item} className='dnd-column'>
            <List
              title={item}
              onDragEnd={onDragEnd}
              name={item}
              statistic={statistic}
              isDropDisabled={checkDisable(index)}
              total={items[item]?.length}
              loading={orders[item].loading}
              reloadCurrentOrder={reloadCurrentOrder}
            >
              <Scrollbars
                onScroll={(e) => handleScroll(e, item)}
                autoHeight
                autoHeightMin={'76vh'}
                autoHeightMax={'76vh'}
                autoHide
                id={item}
              >
                {!Boolean(orders[item].loading && !items[item]?.length)
                  ? items[item]?.map((data, index) => (
                      <>
                        <Draggable
                          key={data.id}
                          draggableId={data.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <OrderCard
                                data={data}
                                goToEdit={goToEdit}
                                goToShow={goToShow}
                                getInvoiceFile={getInvoiceFile}
                              />
                            </div>
                          )}
                        </Draggable>
                      </>
                    ))
                  : mockOrderList[item]?.map(() => (
                      <OrderCardLoader loading={true} />
                    ))}
                {orders[item].loading && item === key && (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{
                          fontSize: 24,
                        }}
                        spin
                      />
                    }
                  />
                )}
              </Scrollbars>
            </List>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Incorporate;
