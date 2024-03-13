import request from './request';

const statisticService = {
  getAllCount: (params) =>
    request.get('dashboard/admin/statistics/count', { params }),
  getAllSum: (params) =>
    request.get(`dashboard/admin/statistics/sum`, { params }),
  topCustomers: (params) =>
    request.get(`dashboard/admin/statistics/customer/top`, { params }),
  topProducts: (params) =>
    request.get(`dashboard/admin/statistics/products/top`, { params }),
  orderSales: (params) =>
    request.get(`dashboard/admin/statistics/orders/sales`, { params }),
  ordersCount: (params) =>
    request.get(`dashboard/admin/statistics/orders/count`, { params }),
};

export default statisticService;
