import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/seller/order';

const initialState = {
  loading: false,
  orders: [],
  new: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'new',
    },
    loading: false,
  },
  accepted: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'accepted',
    },
    loading: false,
  },
  ready: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'ready',
    },
    loading: false,
  },
  on_a_way: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'on_a_way',
    },
    loading: false,
  },
  delivered: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'delivered',
    },
    loading: false,
  },
  canceled: {
    meta: {},
    error: '',
    params: {
      page: 1,
      perPage: 5,
      status: 'canceled',
    },
    loading: false,
  },
  error: '',
  params: {
    page: 1,
    perPage: 5,
  },
  meta: {},
  statistic: {},
  layout: 'board',
  items: {
    new: [],
    accepted: [],
    ready: [],
    on_a_way: [],
    delivered: [],
    canceled: [],
  },
};
export const handleSearch = createAsyncThunk(
  'order/handleSearch',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchNewOrders = createAsyncThunk(
  'order/fetchNewOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.new.params, ...params })
      .then((res) => res);
  }
);
export const fetchAcceptedOrders = createAsyncThunk(
  'order/fetchAcceptedOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.accepted.params, ...params })
      .then((res) => res);
  }
);
export const fetchReadyOrders = createAsyncThunk(
  'order/fetchReadyOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.ready.params, ...params })
      .then((res) => res);
  }
);
export const fetchOnAWayOrders = createAsyncThunk(
  'order/fetchOnAWayOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.on_a_way.params, ...params })
      .then((res) => res);
  }
);
export const fetchDeliveredOrders = createAsyncThunk(
  'order/fetchDeliveredOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.delivered.params, ...params })
      .then((res) => res);
  }
);
export const fetchCanceledOrders = createAsyncThunk(
  'order/fetchCanceledOrders',
  (params = {}) => {
    return orderService
      .getAll({ ...initialState.canceled.params, ...params })
      .then((res) => res);
  }
);

const orderSlice = createSlice({
  name: 'sellerOrders',
  initialState,
  extraReducers: (builder) => {
    //handleSearch
    builder.addCase(handleSearch.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(handleSearch.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      const groupByStatus = orders.reduce((group, order) => {
        const { status } = order;
        group[status] = group[status] ?? [];
        group[status].push(order);
        return group;
      }, {});
      state.loading = false;
      state.items = {
        new: [],
        accepted: [],
        ready: [],
        on_a_way: [],
        delivered: [],
        canceled: [],
        ...groupByStatus,
      };
      state.statistic = {
        new: statistic.new_orders_count,
        accepted: statistic.accepted_orders_count,
        ready: statistic.ready_orders_count,
        on_a_way: statistic.on_a_way_orders_count,
        delivered: statistic.delivered_orders_count,
        canceled: statistic.cancel_orders_count,
      };
      state.meta = meta;
      state.params.page = meta.current_page;
      state.params.perPage = meta.per_page;
      state.error = '';
    });
    builder.addCase(handleSearch.rejected, (state, action) => {
      state.loading = false;
      state.items = {
        new: [],
        accepted: [],
        ready: [],
        on_a_way: [],
        delivered: [],
        canceled: [],
      };
      state.error = action.error.message;
    });

    //fetchOrders
    builder.addCase(fetchOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.loading = false;
      state.orders = orders;
      state.meta = meta;
      state.params.page = meta.current_page;
      state.params.perPage = meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.error.message;
    });

    //fetch new orders
    builder.addCase(fetchNewOrders.pending, (state) => {
      state.new.loading = true;
    });
    builder.addCase(fetchNewOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.new.loading = false;
      state.items = {
        ...state.items,
        new: [...orders, ...state.items.new],
      };
      state.statistic = {
        ...state.statistic,
        new: statistic.new_orders_count,
      };
      state.new.meta = meta;
      state.new.params.page = meta.current_page;
      state.new.params.perPage = meta.per_page;
      state.new.error = '';
    });
    builder.addCase(fetchNewOrders.rejected, (state, action) => {
      state.new.loading = false;
      state.items.new = [];
      state.new.error = action.error.message;
    });

    //fetch accepted orders
    builder.addCase(fetchAcceptedOrders.pending, (state) => {
      state.accepted.loading = true;
    });
    builder.addCase(fetchAcceptedOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.accepted.loading = false;
      state.items = {
        ...state.items,
        accepted: [...orders, ...state.items.accepted],
      };
      state.statistic = {
        ...state.statistic,
        accepted: statistic.accepted_orders_count,
      };
      state.accepted.meta = meta;
      state.accepted.params.page = meta.current_page;
      state.accepted.params.perPage = meta.per_page;
      state.accepted.error = '';
    });
    builder.addCase(fetchAcceptedOrders.rejected, (state, action) => {
      state.accepted.loading = false;
      state.items.accepted = [];
      state.accepted.error = action.error.message;
    });

    //fetch ready orders
    builder.addCase(fetchReadyOrders.pending, (state) => {
      state.ready.loading = true;
    });
    builder.addCase(fetchReadyOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.ready.loading = false;
      state.items = {
        ...state.items,
        ready: [...orders, ...state.items.ready],
      };
      state.statistic = {
        ...state.statistic,
        ready: statistic.ready_orders_count,
      };
      state.ready.meta = meta;
      state.ready.params.page = meta.current_page;
      state.ready.params.perPage = meta.per_page;
      state.ready.error = '';
    });
    builder.addCase(fetchReadyOrders.rejected, (state, action) => {
      state.ready.loading = false;
      state.items.ready = [];
      state.ready.error = action.error.message;
    });

    //fetch on a way orders
    builder.addCase(fetchOnAWayOrders.pending, (state) => {
      state.on_a_way.loading = true;
    });
    builder.addCase(fetchOnAWayOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.on_a_way.loading = false;
      state.items = {
        ...state.items,
        on_a_way: [...orders, ...state.items.on_a_way],
      };
      state.statistic = {
        ...state.statistic,
        on_a_way: statistic.on_a_way_orders_count,
      };
      state.on_a_way.meta = meta;
      state.on_a_way.params.page = meta.current_page;
      state.on_a_way.params.perPage = meta.per_page;
      state.on_a_way.error = '';
    });
    builder.addCase(fetchOnAWayOrders.rejected, (state, action) => {
      state.on_a_way.loading = false;
      state.items.on_a_way = [];
      state.on_a_way.error = action.error.message;
    });

    //fetch delivered orders
    builder.addCase(fetchDeliveredOrders.pending, (state) => {
      state.delivered.loading = true;
    });
    builder.addCase(fetchDeliveredOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.delivered.loading = false;
      state.items = {
        ...state.items,
        delivered: [...orders, ...state.items.delivered],
      };
      state.statistic = {
        ...state.statistic,
        delivered: statistic.delivered_orders_count,
      };
      state.delivered.meta = meta;
      state.delivered.params.page = meta.current_page;
      state.delivered.params.perPage = meta.per_page;
      state.delivered.error = '';
    });
    builder.addCase(fetchDeliveredOrders.rejected, (state, action) => {
      state.delivered.loading = false;
      state.items.delivered = [];
      state.delivered.error = action.error.message;
    });

    //fetch canceled orders
    builder.addCase(fetchCanceledOrders.pending, (state) => {
      state.canceled.loading = true;
    });
    builder.addCase(fetchCanceledOrders.fulfilled, (state, action) => {
      const { payload } = action;
      const { meta, orders, statistic } = payload?.data;
      state.canceled.loading = false;
      state.items = {
        ...state.items,
        canceled: [...orders, ...state.items.canceled],
      };
      state.statistic = {
        ...state.statistic,
        canceled: statistic.cancel_orders_count,
      };
      state.canceled.meta = meta;
      state.canceled.params.page = meta.current_page;
      state.canceled.params.perPage = meta.per_page;
      state.canceled.error = '';
    });
    builder.addCase(fetchCanceledOrders.rejected, (state, action) => {
      state.canceled.loading = false;
      state.items.canceled = [];
      state.canceled.error = action.error.message;
    });
  },

  reducers: {
    changeLayout(state, action) {
      state.layout = action.payload;
    },
    setItems(state, action) {
      state.items = action.payload;
    },
    clearCurrentOrders(state, action) {
      state.items[action.payload] = [];
    },
    clearItems(state, action) {
      state.items = {
        new: [],
        accepted: [],
        ready: [],
        on_a_way: [],
        delivered: [],
        canceled: [],
      };
    },
    updateStatistic(state, action) {
      const { payload } = action;
      state.statistic[payload.status] = payload.qty;
    },
  },
});
export const {
  changeLayout,
  setItems,
  clearCurrentOrders,
  clearItems,
  updateStatistic,
} = orderSlice.actions;
export default orderSlice.reducer;
