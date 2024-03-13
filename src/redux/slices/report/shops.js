import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../../services/reports';

const initialState = {
  loading: false,
  chartData: [],
  productList: [],
  error: '',
};

export const fetchShopsProduct = createAsyncThunk(
  'shops/fetchShopsProduct',
  (params = {}) => {
    return ReportService.getShopsProducts({
      ...params,
    }).then((res) => res);
  }
);
export const fetchShopsProductChart = createAsyncThunk(
  'shops/fetchShopsProductChart',
  (params = {}) => {
    return ReportService.getShopsChart({
      ...params,
    }).then((res) => res);
  }
);
export const ShopsProductCompare = createAsyncThunk(
  'shops/ShopsProductCompare',
  (params = {}) => {
    return ReportService.productShopsCompare({
      ...params,
    }).then((res) => res);
  }
);
const orderCountSlice = createSlice({
  name: 'productShops',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchShopsProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShopsProduct.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.productList = payload.data;
      state.error = '';
    });
    builder.addCase(fetchShopsProduct.rejected, (state, action) => {
      state.loading = false;
      state.productList = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchShopsProductChart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShopsProductChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(fetchShopsProductChart.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
    builder.addCase(ShopsProductCompare.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(ShopsProductCompare.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.chartData = payload.data;
      state.error = '';
    });
    builder.addCase(ShopsProductCompare.rejected, (state, action) => {
      state.loading = false;
      state.chartData = [];
      state.error = action.error.message;
    });
  },
});
export default orderCountSlice.reducer;
