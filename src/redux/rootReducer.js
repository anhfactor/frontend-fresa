import cart from './slices/cart';
import formLang from './slices/formLang';
import menu from './slices/menu';
import order from './slices/order';
import category from './slices/category';
import brand from './slices/brand';
import banner from './slices/banner';
import product from './slices/product';
import giftCard from "./slices/giftCard";
import shop from './slices/shop';
import unit from './slices/unit';
import orders from './slices/orders';
import currency from './slices/currency';
import discount from './slices/discount';
import delivery from './slices/delivery';
import blog from './slices/blog';
import notification from './slices/notification';
import deliveryman from './slices/deliveryman';
import user from './slices/user';
import extraGroup from './slices/extraGroup';
import extraValue from './slices/extraValue';
import payment from './slices/payment';
import invite from './slices/invite';
import faq from './slices/faq';
import client from './slices/client';
import transaction from './slices/transaction';
import allShops from './slices/allShops';
import auth from './slices/auth';
import backup from './slices/backup';
import productReview from './slices/productReview';
import orderReview from './slices/orderReview';
import globalSettings from './slices/globalSettings';
import chat from './slices/chat';
import statisticsCount from './slices/statistics/count';
import statisticsSum from './slices/statistics/sum';
import topCustomers from './slices/statistics/topCustomers';
import topProducts from './slices/statistics/topProducts';
import orderCounts from './slices/statistics/orderCounts';
import orderSales from './slices/statistics/orderSales';
import myShop from './slices/myShop';
import wallet from './slices/wallet';
import payoutRequests from './slices/payoutRequests';
import look from './slices/look';
import theme from './slices/theme';
import point from './slices/point';
import role from './slices/role';
import recipeCategory from './slices/recipeCategory';
import recipe from './slices/recipe';
import branch from './slices/branch';
import group from './slices/group';
import bonus from './slices/product-bonus';
import shopBonus from './slices/shop-bonus';
import languages from './slices/languages';
import refund from './slices/refund';
import subscriber from './slices/subscriber';
import messegeSubscriber from './slices/messegeSubscriber';
import emailProvider from './slices/emailProvider';
import sellerOrders from './slices/sellerOrders';
import productReport from './slices/report/products';
import categoryReport from './slices/report/categories';
import orderReport from './slices/report/order';
import stockReport from './slices/report/stock';
import revenueReport from './slices/report/revenue';
import overviewReport from './slices/report/overview';
import productShops from './slices/report/shops';
import warehouse from "./slices/warehouse";

import adminPayouts from './slices/adminPayouts';
import orderStatus from './slices/orderStatus';
import deliveries from './slices/deliveries';
import deliveryStatistics from './slices/delivery-statistic';
import deliveryboyReview from './slices/deliveryboyReview';
import shopTag from './slices/shopTag';
import shopCategory from './slices/shopCategory';
import bonusList from './slices/bonus-list';
import paymentPayload from './slices/paymentPayload';

import parcelOrders from './slices/parcelOrders';
import parcelTypes from './slices/parcelTypes';
import parcelOptions from './slices/parcel-option';

const rootReducer = {
  parcelOrders,
  parcelTypes,
  parcelOptions,
  paymentPayload,
  bonusList,
  shopCategory,
  shopTag,
  deliveryboyReview,
  deliveryStatistics,
  deliveries,
  orderStatus,
  adminPayouts,
  languages,
  cart,
  menu,
  formLang,
  order,
  category,
  brand,
  banner,
  product,
  giftCard,
  shop,
  unit,
  orders,
  currency,
  discount,
  delivery,
  blog,
  notification,
  deliveryman,
  user,
  extraGroup,
  extraValue,
  payment,
  invite,
  faq,
  client,
  transaction,
  allShops,
  auth,
  backup,
  productReview,
  orderReview,
  globalSettings,
  chat,
  statisticsCount,
  statisticsSum,
  topProducts,
  topCustomers,
  orderCounts,
  orderSales,
  myShop,
  wallet,
  payoutRequests,
  look,
  theme,
  point,
  role,
  recipeCategory,
  recipe,
  branch,
  group,
  bonus,
  shopBonus,
  refund,
  subscriber,
  messegeSubscriber,
  emailProvider,
  sellerOrders,
  productReport,
  categoryReport,
  orderReport,
  stockReport,
  revenueReport,
  overviewReport,
  productShops,
  warehouse
};

export default rootReducer;
