// ** React Imports
import { lazy } from 'react';

export const SellerRoutes = [
  {
    path: 'my-shop',
    component: lazy(() => import('views/my-shop')),
  },
  {
    path: 'seller/categories',
    component: lazy(() => import('views/seller-views/categories')),
  },
  {
    path: 'seller/brands',
    component: lazy(() => import('views/seller-views/brands')),
  },
  {
    path: 'seller/products',
    component: lazy(() => import('views/seller-views/products/products')),
  },
  {
    path: 'seller/gift-cards',
    component: lazy(() => import('views/seller-views/gift-cards/gift-cards')),
  },
  {
    path: 'seller/invites',
    component: lazy(() => import('views/seller-views/invites')),
  },
  {
    path: 'seller/discounts',
    component: lazy(() => import('views/seller-views/discounts')),
  },
  {
    path: 'discount/:id',
    component: lazy(() => import('views/seller-views/discounts/discount-edit')),
  },
  {
    path: 'discount/add',
    component: lazy(() => import('views/seller-views/discounts/discount-add')),
  },
  {
    path: 'seller/product/add/:uuid',
    component: lazy(() => import('views/seller-views/products/products-add')),
  },
  {
    path: 'seller/gift-card/add/:uuid',
    component: lazy(() => import('views/seller-views/products/products-add')),
  },
  {
    path: 'seller/product/edit/:uuid',
    component: lazy(() => import('views/seller-views/products/product-edit')),
  },
  {
    path: 'seller/gift-card/edit/:uuid',
    component: lazy(() => import('views/seller-views/products/product-edit')),
  },
  {
    path: 'seller/delivery/list',
    component: lazy(() => import('views/seller-views/delivery/delivery')),
  },
  {
    path: 'seller/deliveries/add',
    component: lazy(() => import('views/seller-views/delivery/delivery-add')),
  },
  {
    path: 'seller/delivery/:id',
    component: lazy(() => import('views/seller-views/delivery/delivery-add')),
  },
  {
    path: 'seller/delivery/deliveryman',
    component: lazy(() => import('views/seller-views/delivery/deliverymans')),
  },
  {
    path: 'seller/pos-system',
    component: lazy(() => import('views/seller-views/pos-system/pos-system')),
  },
  {
    path: 'seller/orders',
    component: lazy(() => import('views/seller-views/order/order')),
  },
  {
    path: 'seller/orders-board',
    component: lazy(() => import('views/seller-views/order/order')),
  },
  {
    path: 'seller/order/details/:id',
    component: lazy(() => import('views/seller-views/order/order-details')),
  },
  {
    path: 'seller/shop-users',
    component: lazy(() => import('views/seller-views/user/shop-users')),
  },
  {
    path: 'seller/payouts',
    component: lazy(() => import('views/seller-views/payouts')),
  },
  {
    path: 'seller/subscriptions',
    component: lazy(() => import('views/seller-views/subscriptions')),
  },
  {
    path: 'seller/recipes',
    component: lazy(() => import('views/seller-views/recipes')),
  },
  {
    path: 'seller/recipes/add',
    component: lazy(() => import('views/seller-views/recipes/recipe-add')),
  },
  {
    path: 'seller/recipes/:id',
    component: lazy(() => import('views/seller-views/recipes/recipe-edit')),
  },
  {
    path: 'seller/product/add',
    component: lazy(() =>
      import('views/seller-views/products/product-new-add')
    ),
  },
  {
    path: 'seller/gift-card/add',
    component: lazy(() =>
        import('views/seller-views/products/gift-card-new-add')
    ),
  },
  {
    path: 'seller/product/:uuid',
    component: lazy(() =>
      import('views/seller-views/products/product-new-add')
    ),
  },
  {
    path: 'dashboard',
    component: lazy(() => import('views/seller-views/order/orders-add')),
  },
  {
    path: 'seller/orders/add',
    component: lazy(() => import('views/seller-views/order/orders-add')),
  },
  {
    path: 'seller/orders/:id',
    component: lazy(() => import('views/seller-views/order/order-edit')),
  },

  {
    path: 'seller/banner',
    component: lazy(() => import('views/seller-views/banners/banners')),
  },
  {
    path: 'seller/banner/add',
    component: lazy(() => import('views/seller-views/banners/banner-add')),
  },
  {
    path: 'seller/banner/:id',
    component: lazy(() => import('views/seller-views/banners/banner-edit')),
  },
  {
    path: 'seller/product/import',
    component: lazy(() => import('views/seller-views/products/product-import')),
  },
  {
    path: 'seller/branch',
    component: lazy(() => import('views/seller-views/branch/branch')),
  },
  {
    path: 'seller/branch/add',
    component: lazy(() => import('views/seller-views/branch/branch-add')),
  },
  {
    path: 'seller/branch/:id',
    component: lazy(() => import('views/seller-views/branch/branch-edit')),
  },
  {
    path: 'seller/payments',
    component: lazy(() => import('views/seller-views/payment')),
  },
  {
    path: 'seller/payments/add',
    component: lazy(() => import('views/seller-views/payment/payment-add')),
  },
  {
    path: 'seller/payments/:id',
    component: lazy(() => import('views/seller-views/payment/payment-edit')),
  },
  {
    path: 'seller/bonus/product',
    component: lazy(() =>
      import('views/seller-views/product-bonus/product-bonus')
    ),
  },
  {
    path: 'seller/product-bonus/:id',
    component: lazy(() =>
      import('views/seller-views/product-bonus/product-bonus-edit')
    ),
  },
  {
    path: 'seller/product-bonus/add',
    component: lazy(() =>
      import('views/seller-views/product-bonus/product-bonus-add')
    ),
  },
  {
    path: 'seller/shop-bonus/:id',
    component: lazy(() =>
      import('views/seller-views/shop-bonus/shop-bonus-edit')
    ),
  },
  {
    path: 'seller/bonus',
    component: lazy(() => import('views/seller-views/bonus/bonus')),
  },
  {
    path: 'seller/reviews/order',
    component: lazy(() => import('views/seller-views/reviews/orderReviews')),
  },
  {
    path: 'seller/refunds',
    component: lazy(() => import('views/seller-views/refund')),
  },
  {
    path: 'seller/refund/details/:id',
    component: lazy(() => import('views/seller-views/refund/refund-details')),
  },
  {
    path: 'seller/reviews/product',
    component: lazy(() => import('views/seller-views/reviews/productReviews')),
  },
  {
    path: 'seller/transactions',
    component: lazy(() => import('views/seller-views/transactions')),
  },
  {
    path: 'coupons',
    component: lazy(() => import('views/coupons/Coupon')),
  },
  {
    path: 'seller/bonus/shop',
    component: lazy(() => import('views/seller-views/shop-bonus/shop-bonus')),
  },
  {
    path: 'seller/shop-bonus/add',
    component: lazy(() =>
      import('views/seller-views/shop-bonus/shop-bonus-add')
    ),
  },
  {
    path: 'seller/shop-bonus/:id',
    component: lazy(() =>
      import('views/seller-views/shop-bonus/shop-bonus-edit')
    ),
  },
  {
    path: 'seller/warehouse',
    component: lazy(() => import('views/seller-views/warehouse/warehouse'))
  },
  {
    path: 'seller/warehouse/:id',
    component: lazy(() => import('views/seller-views/warehouse/warehouse-detail'))
  },
  {
    path: 'seller/warehouse/create',
    component: lazy(() => import('views/seller-views/warehouse/warehouse-create'))
  }
];
