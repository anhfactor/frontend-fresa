import request from '../request';

const statisticService = {
  getAllCount: (params) =>
    request.get('dashboard/seller/statistics/count', { params }),
  getAllSum: (params) =>
    request.get(`dashboard/seller/statistics/sum`, { params }),
  topCustomers: (params) =>
    request.get(`dashboard/seller/statistics/customer/top`, { params }),
  topProducts: (params) =>
    request.get(`dashboard/seller/statistics/products/top`, { params }),
  orderSales: (params) =>
    request.get(`dashboard/seller/statistics/orders/sales`, { params }),
  ordersCount: (params) =>
    request.get(`dashboard/seller/statistics/orders/count`, { params }),
};

export default statisticService;
