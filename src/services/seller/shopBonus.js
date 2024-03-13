import request from '../request';

const shopBonusService = {
  getAll: (params) => request.get('dashboard/seller/bonus-shop', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/bonus-shop/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/bonus-shop', data, {}),
  update: (id, data) =>
    request.put(`dashboard/seller/bonus-shop/${id}`, data, {}),
  delete: (id) => request.delete(`dashboard/seller/bonus-shop`, { data: id }),
  setActive: (id) => request.post(`dashboard/seller/bonus-shop/status/${id}`),
};

export default shopBonusService;
