import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import productService from "../../services/product";
import sellerProductService from "../../services/seller/product";
import {fetchSellerProducts} from "./product";

const initialState = {
    loading: false,
    giftCards: [],
    error: '',
    params: {
        page: 1,
        perPage: 10,
        gift: 1
    },
    meta: {},
};

export const fetchGiftCards = createAsyncThunk(
    'giftCard/fetchGiftCards',
    (params = {}) => {
        return productService.getAll({...initialState.params, ...params})
    }
)

export const fetchSellerGiftCards = createAsyncThunk(
    'giftCard/fetchSellerGiftCards',
    (params = {}) => {
        return sellerProductService
            .getAll({...initialState.params, ...params})
    })

const giftCardSlice = createSlice({
    name: "giftCard",
    initialState,
    extraReducers(builder) {
        builder.addCase(fetchGiftCards.pending, (state) => {
            state.loading = true
        });
        builder.addCase(fetchGiftCards.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.giftCards = payload.data.map((item) => ({
                ...item,
                id: item.id,
                uuid: item.uuid,
                name: item.translation ? item.translation.title : 'no name',
                active: item.active,
                img: item.img,
            }));
            state.meta = payload.meta;
            state.params.page = payload.meta.current_page;
            state.params.perPage = payload.meta.per_page;
            state.error = '';
        });
        builder.addCase(fetchGiftCards.rejected, (state, action) => {
            state.loading = false;
            state.giftCards = [];
            state.error = action.error.message;
        });

        //seller product
        builder.addCase(fetchSellerGiftCards.pending, (state) => {
            state.loading = true;
        });

        builder.addCase(fetchSellerGiftCards.fulfilled, (state, {payload}) => {
            state.loading = false;
            state.giftCards = payload.data?.map((item) => ({
                ...item,
                id: item.id,
                uuid: item.uuid,
                name: item.product?.translation
                    ? item.product?.translation.title
                    : 'no name',
                active: item.active,
                img: item.product?.img,
            }));
            state.meta = payload.meta;
            state.params.page = payload.meta.current_page;
            state.params.perPage = payload.meta.per_page;
            state.error = '';
        });
        builder.addCase(fetchSellerGiftCards.rejected, (state, action) => {
            state.loading = false;
            state.giftCards = [];
            state.error = action.error.message;
        })
    }
});

export default giftCardSlice.reducer;