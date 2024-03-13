import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../../services/group';

const initialState = {
    loading: false,
    groups: [],
    error: '',
    params: {
        page: 1,
        perPage: 10,
    },
    meta: {},
};

export const fetchGroups = createAsyncThunk(
    'invite/fetchGroups',
    (params = {}) => {
        return groupService
            .getAll({ ...initialState.params, ...params })
            .then((res) => res);
    }
);

const inviteSlice = createSlice({
    name: 'group',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchGroups.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchGroups.fulfilled, (state, action) => {
            const { payload } = action;
            state.loading = false;
            state.groups = payload.data;
            state.meta = payload?.meta;
            state.params.page = payload.meta.current_page;
            state.params.perPage = payload.meta.per_page;
            state.error = '';
        });
        builder.addCase(fetchGroups.rejected, (state, action) => {
            state.loading = false;
            state.groups = [];
            state.error = action.error.message;
        });
    },
});

export default inviteSlice.reducer;
