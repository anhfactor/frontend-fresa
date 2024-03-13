import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orderItems: [],
  orderProducts: [],
  orderData: null,
  paymentData: null,
  data: {
    user: '',
    userUuid: '',
    address: '',
    currency: '',
    payment_type: '',
    deliveries: [],
    shop: null,
    delivery_fee: 0,
  },
  total: {
    product_total: 0,
    product_tax: 0,
    order_tax: 0,
    order_total: 0,
    cashback: 0,
  },
  coupon: {},
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrderItem(state, action) {
      const { payload } = action;
      const existingIndex = state.orderItems.findIndex(
        (item) => item.id === payload.id
      );
      if (existingIndex >= 0) {
        state.orderItems[existingIndex] = payload;
      } else {
        state.orderItems.push(payload);
      }
    },
    reduceOrderItem(state, action) {
      const { payload } = action;
      const itemIndex = state.orderItems.findIndex(
        (item) => item.id === payload.id
      );
      if (state.orderItems[itemIndex].quantity > 1) {
        state.orderItems[itemIndex].quantity -= 1;
      } else if (state.orderItems[itemIndex].quantity === 1) {
        const nextOrderItems = state.orderItems.filter(
          (item) => item.id !== payload.id
        );
        state.orderItems = nextOrderItems;
      }
    },
    removeFromOrder(state, action) {
      const { payload } = action;
      const nextOrderItems = state.orderItems.filter(
        (item) => item.id !== payload.id
      );
      state.orderItems = nextOrderItems;
    },
    clearOrder(state) {
      state.orderItems = [];
      state.orderProducts = [];
      state.data = initialState.data;
      state.coupons = [];
      state.total = initialState.total;
    },
    setOrderProducts(state, action) {
      const { payload } = action;
      state.orderProducts = payload;
    },
    setOrderItems(state, action) {
      const { payload } = action;
      state.orderItems = payload;
    },
    setOrderCurrency(state, action) {
      const { payload } = action;
      state.data.currency = payload;
    },
    setCurrentShop(state, action) {
      const { payload } = action;
      state.data.shop = payload;
    },
    setOrderData(state, action) {
      const { payload } = action;
      state.data = { ...state.data, ...payload };
    },
    setOrder(state, action) {
      const { payload } = action;
      state.orderData = payload;
    },
    setPayment(state, action) {
      const { payload } = action;
      state.paymentData = payload;
    },
    setOrderTotal(state, action) {
      const { payload } = action;
      state.total = payload;
    },
    setCashback(state, action) {
      const { payload } = action;
      state.total.cashback = payload;
    },
    addOrderCoupon(state, action) {
      const { payload } = action;
      state.coupon = payload;
    },
    verifyOrderCoupon(state, action) {
      const { payload } = action;
      state.coupon.verified = payload.verified;
      state.coupon.price = payload.price;
    },
    clearOrderProducts(state) {
      state.orderProducts = [];
      state.total = initialState.total;
    },
    clearOrderItems(state) {
      state.orderItems = [];
    },
  },
});

export const {
  addOrderItem,
  removeFromOrder,
  clearOrder,
  setOrderProducts,
  setOrderItems,
  setOrderCurrency,
  setOrderData,
  clearOrderProducts,
  setOrderTotal,
  addOrderCoupon,
  verifyOrderCoupon,
  setCashback,
  setCurrentShop,
  clearOrderItems,
  setOrder,
  setPayment
} = orderSlice.actions;
export default orderSlice.reducer;
