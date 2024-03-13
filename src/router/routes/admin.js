// ** React Imports
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

export const AdminRoutes = [
  {
    path: '/',
    component: <Navigate to='dashboard' />,
  },
  {
    path: 'chat',
    component: lazy(() => import('views/chat/chat')),
  },
  {
    path: 'dashboard',
    component: lazy(() => import('views/dashboard')),
  },
  {
    path: 'pos-system',
    component: lazy(() => import('views/pos-system')),
  },
  {
    path: 'orders-board',
    component: lazy(() => import('views/order/all-orders')),
  },
  {
    path: 'orders-board/:type',
    component: lazy(() => import('views/order/all-orders')),
  },
  {
    path: 'order/details/:id',
    component: lazy(() => import('views/order/order-details')),
  },
  {
    path: 'order/:id',
    component: lazy(() => import('views/order/order-edit')),
  },
  {
    path: 'reviews/order',
    component: lazy(() => import('views/reviews/orderReviews')),
  },
  {
    path: 'refunds',
    component: lazy(() => import('views/refund')),
  },
  {
    path: 'refund/details/:id',
    component: lazy(() => import('views/refund/refund-details')),
  },
  {
    path: 'deliveries/list',
    component: lazy(() => import('views/delivery-list/deliveriesList')),
  },
  {
    path: 'deliveries/map',
    component: lazy(() => import('views/deliveriesMap/delivery-map-orders')),
  },
  {
    path: 'deliveries/map/:id',
    component: lazy(() => import('views/deliveriesMap/delivery-map-orders')),
  },
  {
    path: 'delivery/orders',
    component: lazy(() => import('views/delivery-orders')),
  },
  {
    path: 'delivery/orders/:id',
    component: lazy(() => import('views/delivery-orders/order-delivery')),
  },
  {
    path: 'delivery/statistics',
    component: lazy(() =>
      import('views/delivery-statistics/delivery-statistics')
    ),
  },
  {
    path: 'reviews/deliveryboy',
    component: lazy(() => import('views/reviews/deliveryBoyReviews')),
  },
  {
    path: 'shops',
    component: lazy(() => import('views/shops/shops')),
  },
  {
    path: 'shop-tag',
    component: lazy(() => import('views/shop-tag')),
  },
  {
    path: 'shop-tag/add',
    component: lazy(() => import('views/shop-tag/tag-add')),
  },
  {
    path: 'shop-tag/:id',
    component: lazy(() => import('views/shop-tag/tag-edit')),
  },
  {
    path: 'shop-tag/clone/:id',
    component: lazy(() => import('views/shop-tag/tag-clone')),
  },
  {
    path: 'catalog/groups',
    component: lazy(() => import('views/groups/groups')),
  },
  {
    path: 'catalog/products',
    component: lazy(() => import('views/products/products')),
  },
  {
    path: 'catalog/gift-cards',
    component: lazy(() => import('views/gift-cards/gift-cards')),
  },
  {
    path: 'catalog/categories',
    component: lazy(() => import('views/categories')),
  },
  {
    path: 'catalog/categories/import',
    component: lazy(() => import('views/categories/category-import')),
  },
  {
    path: 'catalog/recipe-categories',
    component: lazy(() => import('views/recipe-categories')),
  },
  {
    path: 'reviews/product',
    component: lazy(() => import('views/reviews/productReviews')),
  },
  {
    path: 'catalog/brands',
    component: lazy(() => import('views/brands/brands')),
  },
  {
    path: 'catalog/brands/import',
    component: lazy(() => import('views/brands/brand-import')),
  },
  {
    path: 'catalog/units',
    component: lazy(() => import('views/units')),
  },
  {
    path: 'banners',
    component: lazy(() => import('views/banners/banners')),
  },
  {
    path: 'blogs',
    component: lazy(() => import('views/blog')),
  },
  {
    path: 'gallery',
    component: lazy(() => import('views/gallery')),
  },
  {
    path: 'notifications',
    component: lazy(() => import('views/notification')),
  },
  {
    path: 'users/user',
    component: lazy(() => import('views/user/user')),
  },
  {
    path: 'user/add',
    component: lazy(() => import('views/user/user-add')),
  },
  {
    path: 'users/admin',
    component: lazy(() => import('views/user/admin')),
  },
  {
    path: 'users/role',
    component: lazy(() => import('views/user/role-list')),
  },
  {
    path: 'wallets',
    component: lazy(() => import('views/wallet')),
  },
  {
    path: 'users',
    component: lazy(() => import('views/user')),
  },
  {
    path: 'email/subscriber',
    component: lazy(() => import('views/email-subscribers')),
  },
  {
    path: 'subscriber',
    component: lazy(() => import('views/subscriber/subscriber')),
  },
  {
    path: 'message/subscriber',
    component: lazy(() => import('views/message-subscribers/subciribed')),
  },
  {
    path: 'transactions',
    component: lazy(() => import('views/transactions')),
  },
  {
    path: 'payout-requests',
    component: lazy(() => import('views/payout-requests')),
  },
  {
    path: 'payouts',
    component: lazy(() => import('views/admin-payouts')),
  },
  {
    path: 'subscriptions',
    component: lazy(() => import('views/subscriptions/subscriptions')),
  },
  {
    path: 'cashback',
    component: lazy(() => import('views/cashback')),
  },
  {
    path: 'settings/referal',
    component: lazy(() => import('views/settings/referral-setting')),
  },
  {
    path: 'bonus/list',
    component: lazy(() => import('views/bonus')),
  },
  {
    path: 'report',
    component: lazy(() => import('views/report')),
  },
  {
    path: 'report/products',
    component: lazy(() => import('views/report-products')),
  },
  {
    path: 'report/orders',
    component: lazy(() => import('views/report-orders')),
  },
  {
    path: 'report/categories',
    component: lazy(() => import('views/report-categories')),
  },
  {
    path: 'report/overview',
    component: lazy(() => import('views/report-overview')),
  },
  {
    path: 'report/revenue',
    component: lazy(() => import('views/report-revenue')),
  },
  {
    path: 'report/shops',
    component: lazy(() => import('views/report-shop')),
  },
  {
    path: 'settings/faqs',
    component: lazy(() => import('views/faq')),
  },
  {
    path: 'settings/terms',
    component: lazy(() => import('views/privacy/terms')),
  },
  {
    path: 'settings/policy',
    component: lazy(() => import('views/privacy/policy')),
  },
  {
    path: 'settings/general',
    component: lazy(() => import('views/settings/general-settings')),
  },
  {
    path: 'currencies',
    component: lazy(() => import('views/currencies/currencies')),
  },
  {
    path: 'settings/payments',
    component: lazy(() => import('views/payments')),
  },
  {
    path: 'payment-payloads',
    component: lazy(() => import('views/payment-payloads')),
  },
  {
    path: 'settings/sms-gateways',
    component: lazy(() => import('views/sms-gateways')),
  },
  {
    path: 'settings/emailProviders',
    component: lazy(() => import('views/settings/emailSettings')),
  },
  {
    path: 'settings/firebase',
    component: lazy(() => import('views/settings/firebaseConfig')),
  },
  {
    path: 'settings/social',
    component: lazy(() => import('views/settings/socialSettings')),
  },
  {
    path: 'settings/app',
    component: lazy(() => import('views/settings/app-setting')),
  },
  {
    path: 'settings',
    component: lazy(() => import('views/settings/settings')),
  },
  {
    path: 'settings/languages',
    component: lazy(() => import('views/languages/languages')),
  },
  {
    path: 'settings/translations',
    component: lazy(() => import('views/translations')),
  },
  {
    path: 'settings/backup',
    component: lazy(() => import('views/backup')),
  },
  {
    path: 'settings/system-information',
    component: lazy(() => import('views/system-information')),
  },
  {
    path: 'settings/update',
    component: lazy(() => import('views/update')),
  },
  {
    path: 'payment-payloads/edit/:id',
    component: lazy(() => import('views/payment-payloads/payload-edit')),
  },
  {
    path: 'payment-payloads/add',
    component: lazy(() => import('views/payment-payloads/payload-add')),
  },
  {
    path: 'message/subscriber/add',
    component: lazy(() => import('views/message-subscribers/subciribed-add')),
  },
  {
    path: 'message/subscriber/:id',
    component: lazy(() => import('views/message-subscribers/subciribed-edit')),
  },
  {
    path: 'recipe-category/:id',
    component: lazy(() =>
      import('views/recipe-categories/recipe-category-edit')
    ),
  },
  {
    path: 'recipe-category/:id',
    component: lazy(() =>
      import('views/recipe-categories/recipe-category-edit')
    ),
  },
  {
    path: 'gallery/:type',
    component: lazy(() => import('views/gallery/gallery-languages')),
  },
  {
    path: 'faq/:uuid',
    component: lazy(() => import('views/faq/faq-edit')),
  },
  {
    path: 'blog/:uuid',
    component: lazy(() => import('views/blog/blog-edit')),
  },
  {
    path: 'my-shop/edit',
    component: lazy(() => import('views/my-shop/main')),
  },
  {
    path: 'unit/:id',
    component: lazy(() => import('views/units/unit-edit')),
  },
  {
    path: 'coupon/:id',
    component: lazy(() => import('views/coupons/CouponAdd')),
  },
  {
    path: 'notification/:uuid',
    component: lazy(() => import('views/notification/notification-edit')),
  },
  {
    path: 'banner/:id',
    component: lazy(() => import('views/banners/banner-edit')),
  },
  {
    path: 'user/delivery/:uuid',
    component: lazy(() => import('views/user/user-edit')),
  },
  {
    path: 'user/:uuid',
    component: lazy(() => import('views/user/user-edit')),
  },
  {
    path: 'users/user/:id',
    component: lazy(() => import('views/user/user-detail')),
  },
  {
    path: 'orders/generate-invoice/:id',
    component: lazy(() => import('views/check/check')),
  },
  {
    path: 'delivery/:id',
    component: lazy(() => import('views/delivery/delivery-add')),
  },
  {
    path: 'subscriptions/edit',
    component: lazy(() => import('views/subscriptions/subscriptions-edit')),
  },
  {
    path: 'product-clone/:uuid',
    component: lazy(() => import('views/products/product-clone')),
  },
  {
    path: 'product/:uuid',
    component: lazy(() => import('views/products/product-edit')),
  },
  {
    path: 'gift-card/:uuid',
    component: lazy(() => import('views/products/gift-card-edit')),
  },
  {
    path: 'catalog/product/import',
    component: lazy(() => import('views/products/product-import')),
  },
  {
    path: 'shop-clone/:uuid',
    component: lazy(() => import('views/shops/shops-add')),
  },
  {
    path: 'shop/:uuid',
    component: lazy(() => import('views/shops/shops-add')),
  },
  {
    path: 'brand-clone/:id',
    component: lazy(() => import('views/brands/brands-clone')),
  },
  {
    path: 'brand/:id',
    component: lazy(() => import('views/brands/brands-edit')),
  },
  {
    path: 'currency/:id',
    component: lazy(() => import('views/currencies/currency-edit')),
  },
  {
    path: 'category-clone/:uuid',
    component: lazy(() => import('views/categories/category-clone')),
  },
  {
    path: 'category/:uuid',
    component: lazy(() => import('views/categories/category-edit')),
  },
  {
    path: 'language/:id',
    component: lazy(() => import('views/languages/language-add')),
  },
  {
    path: 'group/:id',
    component: lazy(() => import('views/groups/group-edit')),
  },
  {
    path: 'groups/add',
    component: lazy(() => import('views/groups/group-add')),
  },
  {
    path: 'recipe-category/add',
    component: lazy(() =>
      import('views/recipe-categories/recipe-category-add')
    ),
  },
  {
    path: 'faq/add',
    component: lazy(() => import('views/faq/faq-add')),
  },
  {
    path: 'blog/add',
    component: lazy(() => import('views/blog/blog-add')),
  },
  {
    path: 'unit/add',
    component: lazy(() => import('views/units/unit-add')),
  },
  {
    path: 'ticket/add',
    component: lazy(() => import('views/tickets/ticketAdd')),
  },
  {
    path: 'coupon/add',
    component: lazy(() => import('views/coupons/CouponAdd')),
  },
  {
    path: 'notification/add',
    component: lazy(() => import('views/notification/notification-add')),
  },
  {
    path: 'banner/add',
    component: lazy(() => import('views/banners/banner-add')),
  },
  {
    path: 'add/user/delivery/:role',
    component: lazy(() => import('views/user/user-add-role')),
  },
  {
    path: 'user/add/:role',
    component: lazy(() => import('views/user/user-add-role')),
  },
  {
    path: 'deliveries/add',
    component: lazy(() => import('views/delivery/delivery-add')),
  },
  // {
  //   path: 'order/add',
  //   component: lazy(() => import('views/order/orders-add')),
  // },
  {
    path: 'currency/add',
    component: lazy(() => import('views/currencies/currencies-add')),
  },
  {
    path: 'language/add',
    component: lazy(() => import('views/languages/language-add')),
  },
  {
    path: 'product/add',
    component: lazy(() => import('views/products/products-add')),
  },
  {
    path: 'gift-card/add',
    component: lazy(() => import('views/products/gift-cards-add')),
  },
  {
    path: 'category/add',
    component: lazy(() => import('views/categories/category-add')),
  },
  {
    path: 'brand/add',
    component: lazy(() => import('views/brands/brands-add')),
  },
  {
    path: 'shop/add',
    component: lazy(() => import('views/shops/shops-add')),
  },
  {
    path: 'deliveryman/order/details/:id',
    component: lazy(() => import('views/deliveryman-orders/order-details')),
  },
  {
    path: 'deliveryman/orders',
    component: lazy(() => import('views/deliveryman-orders/order')),
  },
  {
    path: 'delivery/deliveryman',
    component: lazy(() => import('views/delivery/deliveryman')),
  },
  {
    path: 'delivery/list',
    component: lazy(() => import('views/delivery/delivery')),
  },
  {
    path: 'delivery',
    component: lazy(() => import('views/delivery/delivery-list')),
  },

  {
    path: 'parcel-orders',
    component: lazy(() => import('views/parcel-order')),
  },
  {
    path: 'parcel-orders/add',
    component: lazy(() => import('views/parcel-order/parcel-order-add')),
  },
  {
    path: 'parcel-orders/:id',
    component: lazy(() => import('views/parcel-order/parcel-order-edit')),
  },
  {
    path: 'parcel-types',
    component: lazy(() => import('views/parcel-types')),
  },
  {
    path: 'parcel-types/add',
    component: lazy(() => import('views/parcel-types/parcel-type')),
  },
  {
    path: 'parcel-types/:id',
    component: lazy(() => import('views/parcel-types/parcel-type')),
  },
  {
    path: 'options',
    component: lazy(() => import('views/parcel-options')),
  },
  {
    path: 'options/add',
    component: lazy(() => import('views/parcel-options/option-add')),
  },
  {
    path: 'options/:id',
    component: lazy(() => import('views/parcel-options/option-edit')),
  },
];
