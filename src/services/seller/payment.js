import request from '../request';

const paymentService = {
  getAll: (params) => request.get('dashboard/seller/payment', { params }),
  allPayment: (params) =>
    request.get('dashboard/seller/payment/all-payment', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/payment/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/payment', data, {}),
  update: (id, data) => request.put(`dashboard/seller/payment/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/seller/payment/${id}`),
};

export default paymentService;
