import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../../services/seller/recipe';

const initialState = {
  loading: false,
  recipes: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchRecipes',
  (params = {}) => {
    return recipeService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  }
);

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchRecipes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRecipes.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.recipes = payload.data;
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchRecipes.rejected, (state, action) => {
      state.loading = false;
      state.recipes = [];
      state.error = action.error.message;
    });
  },
});

export default recipeSlice.reducer;
