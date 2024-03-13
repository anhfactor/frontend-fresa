import request from '../request';

const orderService = {
  getAll: (params) =>
    request.get('dashboard/seller/orders/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/orders/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/orders', data),
  update: (id, data) => request.put(`dashboard/seller/orders/${id}`, data),
  calculate: (params) =>
    request.get('dashboard/seller/order/calculate/products', { params }),
  updateStatus: (id, data) =>
    request.post(`dashboard/seller/order/${id}/status`, data),
  updateDelivery: (id, data) =>
    request.post(`dashboard/seller/order/${id}/deliveryman`, data),
};

export default orderService;
