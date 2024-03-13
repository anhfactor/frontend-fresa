import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bannerService from '../../services/banner';
import bannerSellerService from '../../services/seller/banner';

const initialState = {
  loading: false,
  banners: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchBanners = createAsyncThunk(
  'banner/fetchBanners',
  (params = {}) => {
    return bannerService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res)
      .catch((err) => err);
  }
);

export const fetchSellerBanners = createAsyncThunk(
  'banner/fetchSellerBanners',
  (params = {}) => {
    return bannerSellerService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res)
      .catch((err) => err);
  }
);

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchBanners.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchBanners.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.banners = payload.data;
      state.meta = payload?.meta;
      state.params.page = payload?.meta?.current_page;
      state.params.perPage = payload?.meta?.per_page;
      state.error = '';
    });
    builder.addCase(fetchBanners.rejected, (state, action) => {
      state.loading = false;
      state.banners = [];
      state.error = action.error?.message;
    });

    //  seller
    builder.addCase(fetchSellerBanners.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerBanners.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.banners = payload.data;
      state.meta = payload?.meta;
      state.params.page = payload?.meta?.current_page;
      state.params.perPage = payload?.meta?.per_page;
      state.error = '';
    });
    builder.addCase(fetchSellerBanners.rejected, (state, action) => {
      state.loading = false;
      state.banners = [];
      state.error = action.error?.message;
    });
  },
});

export default bannerSlice.reducer;
