import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  cartShops: [],
  cartOrder: null,
  cartPayment: null,
  data: [
    {
      user: '',
      userUuid: '',
      address: '',
      paymentType: '',
      deliveries: [],
      bag_id: 0,
      shop: null,
      delivery_fee: 0,
    },
  ],
  total: {
    product_total: 0,
    product_tax: 0,
    order_tax: 0,
    order_total: 0,
    cashback: 0,
  },
  bags: [0],
  currentBag: 0,
  coupons: [],
  currency: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.id === payload.id
      );
      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity += payload.quantity;
      } else {
        state.cartItems.push(payload);
      }
    },
    reduceCart(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (state.cartItems[itemIndex].quantity > 1) {
        state.cartItems[itemIndex].quantity -= 1;
      }
    },
    removeFromCart(state, action) {
      state.cartItems.map((cartItem) => {
        if (cartItem.id === action.payload.id) {
          const nextCartItems = state.cartItems.filter(
            (item) => item.id !== cartItem.id
          );
          state.cartItems = nextCartItems;
        }
        return state;
      });
    },
    setCurrentBag(state, action) {
      const { payload } = action;
      state.currentBag = payload;
    },
    addBag(state, action) {
      const { payload } = action;
      const newBagId = state.bags.length;
      const newData = {
        user: '',
        userUuid: '',
        address: '',
        currency: '',
        paymentType: '',
        deliveries: [],
        bag_id: newBagId,
        shop: payload.shop,
      };
      state.data.push(newData);
      state.bags.push(newBagId);
      state.currentBag = newBagId;
    },
    removeBag(state, action) {
      const { payload } = action;
      state.data = state.data.filter((item) => item.bag_id !== payload);
      state.bags = state.bags.filter((item) => item !== payload);
      state.currentBag = 0;
    },
    setCartCurrency(state, action) {
      const { payload } = action;
      state.currency = payload;
    },
    setCartOrder(state, action) {
      const { payload } = action;
      state.cartOrder = payload;
    },
    setCartPayment(state, action) {
      const { payload } = action;
      state.cartPayment = payload;
    },
    setCartShops(state, action) {
      const { payload } = action;
      state.cartShops = payload;
    },
    setCartData(state, action) {
      const { payload } = action;
      const dataIndex = state.data.findIndex(
        (item) => item.bag_id === payload.bag_id
      );
      state.data[dataIndex] = { ...state.data[dataIndex], ...payload };
    },
    setCartTotal(state, action) {
      const { payload } = action;
      state.total.order_tax = payload.order_tax;
      state.total.order_total = payload.order_total;
      state.total.product_tax = payload.product_tax;
      state.total.product_total = payload.product_total;
    },
    setCartCashback(state, action) {
      const { payload } = action;
      state.total.cashback = payload;
    },
    addCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.shop_id === payload.shop_id
      );
      if (itemIndex >= 0) {
        state.coupons[itemIndex].coupon = payload.coupon;
      } else {
        state.coupons.push(payload);
      }
    },
    verifyCoupon(state, action) {
      const { payload } = action;
      const itemIndex = state.coupons.findIndex(
        (item) => item.shop_id === payload.shop_id
      );
      state.coupons[itemIndex].verified = payload.verified;
      state.coupons[itemIndex].price = payload.price;
    },
    clearCart(state) {
      state.cartItems = state.cartItems.filter(
        (item) => item.bag_id !== state.currentBag
      );
      state.coupons = [];
    },
    clearCartShops(state) {
      state.cartShops = [];
      state.total = initialState.total;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  reduceCart,
  setCartCurrency,
  setCartShops,
  setCartData,
  clearCartShops,
  setCurrentBag,
  setCartTotal,
  addBag,
  removeBag,
  addCoupon,
  verifyCoupon,
  setCartCashback,
  setCartOrder,
  setCartPayment,
} = cartSlice.actions;
export default cartSlice.reducer;
