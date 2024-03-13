import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import lookService from '../../services/seller/look';

const initialState = {
  loading: false,
  looks: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchLooks = createAsyncThunk(
  'banner/fetchLooks',
  (params = {}) => {
    return lookService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const lookSlice = createSlice({
  name: 'look',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchLooks.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchLooks.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.looks = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchLooks.rejected, (state, action) => {
      state.loading = false;
      state.looks = [];
      state.error = action.error.message;
    });
  },
});

export default lookSlice.reducer;
