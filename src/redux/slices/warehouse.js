import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import warehouseService from '../../services/seller/warehouse';

const initialState = {
  loading: false,
  warehouse: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchWarehouse = createAsyncThunk(
  'warehouse/fetchWarehouse',
  (params = {}) => {
    console.log('initialState.params', initialState.params)
    return warehouseService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  extraReducers(builder) {
    builder.addCase(fetchWarehouse.pending, (state) => {
      state.loading = true
    });
    builder.addCase(fetchWarehouse.fulfilled, (state, {payload}) => {
      state.loading = false;
      state.warehouse = payload.data.map((item) => ({
        ...item,
        id: item.id,
        productName: item.shop_product?.product?.translation?.title ? item.shop_product?.product?.translation?.title : 'no name',
        type: item.type,
        quantity: item.quantity,
        img: item.shop_product?.product?.img,
        username: `${item.user?.firstname} ${item.user?.lastname}`
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchWarehouse.rejected, (state, action) => {
      state.loading = false;
      state.warehouse = [];
      state.error = action.error.message;
    })
  },
});

export default warehouseSlice.reducer;
