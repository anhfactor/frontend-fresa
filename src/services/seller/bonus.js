import request from '../request';

const bonusService = {
  getAll: (params) => request.get('dashboard/seller/bonus-product', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/bonus-product/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/bonus-product', data, {}),
  update: (id, data) =>
    request.put(`dashboard/seller/bonus-product/${id}`, data, {}),
  delete: (id) =>
    request.delete(`dashboard/seller/bonus-product`, { data: id }),
  setActive: (id) =>
    request.post(`dashboard/seller/bonus-product/status/${id}`),
};

export default bonusService;
