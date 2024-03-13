import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeCategoryService from '../../services/recipeCategory';

const initialState = {
  loading: false,
  recipeCategories: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchRecipeCategories = createAsyncThunk(
  'recipe/fetchRecipeCategories',
  (params = {}) => {
    return recipeCategoryService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const recipecategorySlice = createSlice({
  name: 'recipeCategory',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchRecipeCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRecipeCategories.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.recipeCategories = payload.data.map((item) => ({
        status: item.status,
        image: item.image,
        title: item.translation ? item.translation.title : '-',
        key: item.id,
        id: item.id,
        children: item.child.map((child) => ({
          title: child.translation ? child.translation.title : '-',
          id: child.id,
          key: child.id,
          image: child.image,
          status: child.status,
        })),
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchRecipeCategories.rejected, (state, action) => {
      state.loading = false;
      state.recipeCategories = [];
      state.error = action.error.message;
    });
  },
});

export default recipecategorySlice.reducer;
