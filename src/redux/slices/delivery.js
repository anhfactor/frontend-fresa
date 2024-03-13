import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import deliveryService from '../../services/delivery-type';
import sellerDeliveryService from '../../services/seller/delivery-type';

const initialState = {
  loading: false,
  deliveries: [],
  error: '',
};

export const fetchDeliveries = createAsyncThunk(
  'delivery/fetchDeliveries',
  (params = {}) => {
    return deliveryService
      .get({ ...initialState.params, ...params })
      .then((res) => res);
  }
);
export const fetchSellerDeliveries = createAsyncThunk(
  'delivery/fetchSellerDeliveries',
  (params = {}) => {
    return sellerDeliveryService
      .get({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchDeliveries.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDeliveries.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.deliveries = payload.data;
    });
    builder.addCase(fetchDeliveries.rejected, (state, action) => {
      state.loading = false;
      state.deliveries = [];
      state.error = action.error.message;
    });

    builder.addCase(fetchSellerDeliveries.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerDeliveries.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.deliveries = payload.data;
    });
    builder.addCase(fetchSellerDeliveries.rejected, (state, action) => {
      state.loading = false;
      state.deliveries = [];
      state.error = action.error.message;
    });
  },
});

export default deliverySlice.reducer;
